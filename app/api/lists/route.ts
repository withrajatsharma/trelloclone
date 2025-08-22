import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../verifyToken";
import { WorkSpace } from "@/models/Workspace";
import { Board } from "@/models/Board";
import { List } from "@/models/List";
import mongoose from "mongoose";

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
