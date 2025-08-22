import { Card } from "@/models/Card";
import { connectToDB } from "@/services/connectdb";
import { broadcastCardPositions, broadcastActivity } from "@/services/realtime";
import { List } from "@/models/List";
import { Board } from "@/models/Board";
import { Activity } from "@/models/Activity";
import verifyToken from "../../verifyToken";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await connectToDB();

    const { updates } = await request.json();

    const user = await verifyToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    const updatedCards = await Promise.all(
      updates.map(({ id, position, listId }) =>
        Card.findByIdAndUpdate(id, { position, listId }, { new: true })
      )
    );

    // derive boardId from any updated card's list
    let boardId;
    try {
      const first = updatedCards.find(Boolean);
      if (first) {
        const list = await List.findById(first.listId);
        if (list) {
          boardId = list.boardId;
        }
      }
    } catch {}

    if (boardId) {
      try {
        // Log activity for card movement
        await Activity.create({
          boardId,
          userId: user.id,
          userFullName: user.fullName,
          action: "card.moved",
          details: { cardCount: updates.length }
        });
        broadcastActivity(boardId.toString(), user.id, user.fullName, "card.moved", { cardCount: updates.length });
        broadcastCardPositions(
          boardId.toString(),
          updates.map((u) => ({ id: u.id, position: u.position, listId: u.listId }))
        );
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "Card positions updated successfully",
    });
  } catch (error) {
    console.error("Error updating card positions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update card positions" },
      { status: 500 }
    );
  }
}
