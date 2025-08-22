import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../../../verifyToken";
import { Activity } from "@/models/Activity";
import { WorkSpace } from "@/models/Workspace";
import { Board } from "@/models/Board";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await context.params;

    const user = await verifyToken();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const board = await Board.findById(id);
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

    const activities = await Activity.find({ boardId: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
