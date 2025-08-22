import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../verifyToken";
import { WorkSpace } from "@/models/Workspace";
import { Board } from "@/models/Board";
import { List } from "@/models/List";
import mongoose from "mongoose";
import { Card } from "@/models/Card";
import { broadcastListCreated, broadcastListDeleted, broadcastListUpdated, broadcastActivity } from "@/services/realtime";
import { Activity } from "@/models/Activity";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { name, boardId, position } = await req.json();
    const trimmedName = (name || "").trim();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, message: "Please provide a list name." },
        { status: 400 }
      );
    }

    if (!boardId) {
      return NextResponse.json(
        { success: false, message: "Invalid board ID." },
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

    const board = await Board.findById(boardId);

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

    const list = await List.create({
      name: trimmedName,
      boardId,
      position: position || 0,
    });

    // Log activity and broadcast
    try {
      await Activity.create({
        boardId,
        userId: user.id,
        userFullName: user.fullName,
        action: "list.created",
        details: { name: trimmedName }
      });
      broadcastActivity(board._id.toString(), user.id, user.fullName, "list.created", { name: trimmedName });
      broadcastListCreated(board._id.toString(), list);
    } catch {}

    return NextResponse.json(
      { success: true, message: "List created successfully.", list },
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

    const { id, boardId } = await req.json();

    if (!id) {
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

    const list = await List.findById(id);

    if (!list) {
      return NextResponse.json(
        { success: false, message: "List not found." },
        { status: 404 }
      );
    }

    const board = await Board.findById(boardId);

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

    await List.deleteOne({ _id: id });

    await   Card.deleteMany({ listId: id });

    try {
      await Activity.create({
        boardId: board._id,
        userId: user.id,
        userFullName: user.fullName,
        action: "list.deleted",
        details: { listId: id }
      });
      broadcastActivity(board._id.toString(), user.id, user.fullName, "list.deleted", { listId: id });
      broadcastListDeleted(board._id.toString(), id);
    } catch {}

    return NextResponse.json(
      { success: true, message: "List deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LIST_DELETE_API] : ", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete list." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDB();

    const { id, name, boardId } = await req.json();
    const trimmedName = (name || "").trim();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, message: "Please provide a list name." },
        { status: 400 }
      );
    }

    if (!boardId) {
      return NextResponse.json(
        { success: false, message: "Invalid board ID." },
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

    const listExist = await List.exists({ _id: id });

    if (!listExist) {
      return NextResponse.json(
        { success: false, message: "List not found." },
        { status: 404 }
      );
    }

    const board = await Board.findById(boardId);

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

    const list = await List.findByIdAndUpdate(
      id,
      {
        name: trimmedName,
      },
      { new: true }
    );

    if (!list) {
      return NextResponse.json(
        { success: false, message: "Failed to update list." },
        { status: 400 }
      );
    }

    if (list) {
      try {
        await Activity.create({
          boardId: board._id,
          userId: user.id,
          userFullName: user.fullName,
          action: "list.updated",
          details: { name: trimmedName }
        });
        broadcastActivity(board._id.toString(), user.id, user.fullName, "list.updated", { name: trimmedName });
        broadcastListUpdated(board._id.toString(), list);
      } catch {}
    }

    return NextResponse.json(
      { success: true, message: "List updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LIST_UPDATE_API] : ", error);
    return NextResponse.json(
      { success: false, message: "Failed to update list." },
      { status: 500 }
    );
  }
}
