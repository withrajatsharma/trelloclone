import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../verifyToken";
import mongoose from "mongoose";
import { WorkSpace } from "@/models/Workspace";
import { Board } from "@/models/Board";
import { revalidatePath, revalidateTag } from "next/cache";
import { List } from "@/models/List";
import { broadcastActivity } from "@/services/realtime";
import { Activity } from "@/models/Activity";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, workSpaceId } = await req.json();
    const trimmedName = (name || "").trim().toLowerCase();

    if (!trimmedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a Board name.",
        },
        { status: 400 }
      );
    }

    if (!workSpaceId) {
      return NextResponse.json(
        {
          success: false,
          message: "invalid workspace ID.",
        },
        { status: 400 }
      );
    }

    const user = await verifyToken();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const workSpace: any = await WorkSpace.findOne({ _id: workSpaceId })
      .select("ownerId")
      .lean();

    const userId = new mongoose.Types.ObjectId(user?.id);

    if (!workSpace || workSpace?.ownerId?.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 400 }
      );
    }

    const existing = await Board.findOne({
      name: trimmedName,
      workSpaceId: workSpaceId,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You already own a Board with this name.",
        },
        { status: 400 }
      );
    }

    const board = await Board.create({
      name: trimmedName,
      workSpaceId: workSpaceId,
      members: [],
    });

    revalidateTag(`workSpace-${workSpaceId}`);
    revalidatePath("/dashboard?workspace=" + workSpaceId);

    await List.create([
      { name: "To Do", boardId: board._id, position: 0 },
      { name: "In Progress", boardId: board._id, position: 1 },
      { name: "Done", boardId: board._id, position: 2 },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Board created successfully.",
        Board: {
          id: board._id,
          name: board.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[BOARD_CREATE_API] : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Board. (error)",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const { name, boardId } = await req.json();
    const trimmedName = (name || "").trim().toLowerCase();

    if (!trimmedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a board name.",
        },
        { status: 400 }
      );
    }

    if (!boardId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a board ID.",
        },
        { status: 400 }
      );
    }

    const user = await verifyToken();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user?.id);

    const board = await Board.findById(boardId);

    if (!board) {
      return NextResponse.json(
        {
          success: false,
          message: "Board not found.",
        },
        { status: 404 }
      );
    }

    const workspace = await WorkSpace.findById(board?.workSpaceId);

    if (!workspace) {
      return NextResponse.json(
        {
          success: false,
          message: "Workspace not found.",
        },
        { status: 404 }
      );
    }

    if (!workspace.ownerId.equals(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update boards in workspaces you own.",
        },
        { status: 403 }
      );
    }

    const existingBoard = await Board.findOne({
      name: trimmedName,
      workspaceId: board.workspaceId,
    });

    if (existingBoard) {
      return NextResponse.json(
        {
          success: false,
          message: "A board with this name already exists in this workspace.",
        },
        { status: 400 }
      );
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      {
        name: trimmedName,
      },
      { new: true }
    );

    if (!updatedBoard) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update board.",
        },
        { status: 400 }
      );
    }

    // Log activity for board update
    try {
      await Activity.create({
        boardId: boardId,
        userId: user.id,
        userFullName: user.fullName,
        action: "board.updated",
        details: { name: trimmedName }
      });
      broadcastActivity(boardId.toString(), user.id, user.fullName, "board.updated", { name: trimmedName });
    } catch {}

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard?workspace=${board.workspaceId}`);
    revalidatePath("/dashboard", "layout");

    return NextResponse.json(
      {
        success: true,
        message: "Board updated successfully.",
        board: {
          id: updatedBoard._id,
          name: updatedBoard.name,
          workspaceId: updatedBoard.workspaceId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[BOARD_UPDATE_API] : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update Board. (error)",
      },
      { status: 500 }
    );
  }
}
