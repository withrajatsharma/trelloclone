import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../verifyToken";
import { WorkSpace } from "@/models/Workspace";
import { Board } from "@/models/Board";
import { List } from "@/models/List";
import mongoose from "mongoose";
import { Card } from "@/models/Card";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { title, listId, position } = await req.json();
    const trimmedName = (title || "").trim();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, message: "Please provide a list name." },
        { status: 400 }
      );
    }

    if (!listId) {
      return NextResponse.json(
        { success: false, message: "Invalid list ID." },
        { status: 400 }
      );
    }

    const user = await verifyToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const list = await List.findById(listId);

    if (!list) {
      return NextResponse.json(
        { success: false, message: "list not found." },
        { status: 404 }
      );
    }

    const board = await Board.findById(list.boardId);

    if (!board) {
      return NextResponse.json(
        { success: false, message: "Board not found." },
        { status: 404 }
      );
    }

    const workSpace = await WorkSpace.findById(board.workSpaceId);

    if (!workSpace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found." },
        { status: 404 }
      );
    }

    // Check if user is a member of the workspace
    const userId = new mongoose.Types.ObjectId(user.id);
    const isMember = workSpace.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.equals(userId)
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this workspace." },
        { status: 403 }
      );
    }

    const card = await Card.create({
      title: trimmedName,
      listId,
      position: position || 0,
    });

    return NextResponse.json(
      { success: true, message: "Card created successfully.", card },
      { status: 201 }
    );
  } catch (error) {
    console.error("[LIST_CREATE_API] : ", error);
    return NextResponse.json(
      { success: false, message: "Failed to create list." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid card ID." },
        { status: 400 }
      );
    }

    const user = await verifyToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const card = await Card.findById(id).populate("listId");

    if (!card || !card.listId) {
      return NextResponse.json(
        { success: false, message: "Card or List not found." },
        { status: 404 }
      );
    }

    const board = await Board.findById(card.listId.boardId);

    if (!board) {
      return NextResponse.json(
        { success: false, message: "Board not found." },
        { status: 404 }
      );
    }

    const workSpace = await WorkSpace.findById(board.workSpaceId);

    if (!workSpace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found." },
        { status: 404 }
      );
    }

    // Check if user is a member of the workspace
    const userId = new mongoose.Types.ObjectId(user.id);
    const isMember = workSpace.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.equals(userId)
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this workspace." },
        { status: 403 }
      );
    }

    await Card.deleteOne({ _id: id });

    return NextResponse.json(
      { success: true, message: "Card deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CARD_DELETE_API] : ", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete card." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDB();

    const { id, title } = await req.json();
    const trimmedTitle = (title || "").trim();

    if (!trimmedTitle) {
      return NextResponse.json(
        { success: false, message: "Please provide a card title." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid card ID." },
        { status: 400 }
      );
    }

    const user = await verifyToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const card = await Card.findById(id).populate({
      path: "listId",
      populate: { path: "boardId", select: "workSpaceId" },
    });

    if (!card || !card.listId || !card.listId.boardId) {
      return NextResponse.json(
        { success: false, message: "Card, List, or Board not found." },
        { status: 404 }
      );
    }

    const workSpace = await WorkSpace.findById(card.listId.boardId.workSpaceId);
    if (!workSpace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found." },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user.id);
    const isMember = workSpace.members.some((memberId: any) =>
      memberId.equals
        ? memberId.equals(userId)
        : memberId.toString() === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this workspace." },
        { status: 403 }
      );
    }

    card.title = trimmedTitle;
    await card.save(); // wait for DB update

    return NextResponse.json(
      { success: true, message: "Card updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CARD_UPDATE_API]: ", error);
    return NextResponse.json(
      { success: false, message: "Failed to update card." },
      { status: 500 }
    );
  }
}
