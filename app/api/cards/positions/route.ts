import { Card } from "@/models/Card";
import { connectToDB } from "@/services/connectdb";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await connectToDB();

    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    const updatePromises = updates.map(({ id, position, listId }) =>
      Card.findByIdAndUpdate(id, { position, listId }, { new: true })
    );

    await Promise.all(updatePromises);

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
