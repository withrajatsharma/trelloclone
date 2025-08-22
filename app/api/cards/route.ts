import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../verifyToken";
import { WorkSpace } from "@/models/Workspace";
import { Board } from "@/models/Board";
import { List } from "@/models/List";
import mongoose from "mongoose";
import { Card } from "@/models/Card";
import { broadcastCardCreated, broadcastCardDeleted, broadcastCardUpdated, broadcastActivity } from "@/services/realtime";
import { Activity } from "@/models/Activity";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { title, listId, position, description, dueDate, priority } = await req.json();
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
      authorId: userId,
      description: description || "",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "medium",
    });

    try {
      await Activity.create({
        boardId: board._id,
        userId: user.id,
        userFullName: user.fullName,
        action: "card.created",
        details: { title: trimmedName }
      });
      broadcastActivity(board._id.toString(), user.id, user.fullName, "card.created", { title: trimmedName });
      broadcastCardCreated(board._id.toString(), card);
    } catch {}

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

    try {
      await Activity.create({
        boardId: board._id,
        userId: user.id,
        userFullName: user.fullName,
        action: "card.deleted",
        details: { cardId: id }
      });
      broadcastActivity(board._id.toString(), user.id, user.fullName, "card.deleted", { cardId: id });
      broadcastCardDeleted(board._id.toString(), id);
    } catch {}

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

    const { id, title, description, dueDate, priority } = await req.json();
    const trimmedTitle = (title || "").trim();

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

    if (trimmedTitle) card.title = trimmedTitle;
    if (typeof description === 'string') card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (priority) card.priority = priority;
    await card.save();

    try {
      await Activity.create({
        boardId: card.listId.boardId._id || card.listId.boardId,
        userId: user.id,
        userFullName: user.fullName,
        action: "card.updated",
        details: { title: card.title }
      });
      const boardId = (card.listId.boardId._id || card.listId.boardId).toString();
      broadcastActivity(boardId, user.id, user.fullName, "card.updated", { title: card.title });
      broadcastCardUpdated(boardId, id, card.title);
    } catch {}

    return NextResponse.json(
      { success: true, message: "Card updated successfully.", card },
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
