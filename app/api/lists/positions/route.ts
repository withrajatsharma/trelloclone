import { List } from "@/models/List";
import { connectToDB } from "@/services/connectdb";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await connectToDB();

    const { boardId, updates } = await request.json();

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
