import { List } from "@/models/List";
import { connectToDB } from "@/services/connectdb";
import { broadcastListPositions, broadcastActivity } from "@/services/realtime";
import { Activity } from "@/models/Activity";
import verifyToken from "../../verifyToken";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await connectToDB();

    const { boardId, updates } = await request.json();

    const user = await verifyToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (!boardId || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    const updatePromises = updates.map(({ id, position }) =>
      List.findByIdAndUpdate(id, { position }, { new: true })
    );

    await Promise.all(updatePromises);

    try {
      // Log activity for list movement
      await Activity.create({
        boardId,
        userId: user.id,
        userFullName: user.fullName,
        action: "list.moved",
        details: { listCount: updates.length }
      });
      broadcastActivity(boardId.toString(), user.id, user.fullName, "list.moved", { listCount: updates.length });
      broadcastListPositions(
        boardId.toString(),
        updates.map((u: any) => ({ id: u.id, position: u.position }))
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: "List positions updated successfully",
    });
  } catch (error) {
    console.error("Error updating list positions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update list positions" },
      { status: 500 }
    );
  }
}
