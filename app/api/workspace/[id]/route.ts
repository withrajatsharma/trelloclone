import { User } from "@/models/User";
import { Board } from "@/models/Board";
import { WorkSpace } from "@/models/Workspace";
import { connectToDB } from "@/services/connectdb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import verifyToken from "../../verifyToken";
import {  revalidateTag } from "next/cache";

export async function getWorkspace(
  id: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) {
  try {
    await connectToDB();

    User;

    if (!userId) {
      return null;
    }

    const workSpace: any = await WorkSpace.findOne({ _id: id })
      .populate("members", "_id fullName")
      .lean();

    if (!workSpace) return null;

    if (
      !workSpace.members
        .map((m: any) => m._id.toString())
        .includes(userId.toString())
    ) {
      return null;
    }

    const boards = await Board.find({ workSpaceId: id })
      .select("_id name")
      .sort({ createdAt: -1 })
      .lean();

    const workSpaceWithBoards = { ...workSpace, boards: boards || [] };

    // console.log(`workSpaceWithBoards:`, workSpaceWithBoards);

    return workSpaceWithBoards;
  } catch (error) {
    console.error("[WORKSPACE_GET_ERROR]", error);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const user = await verifyToken();
    const userId = new mongoose.Types.ObjectId(user?.id);

    const workSpaceId = new mongoose.Types.ObjectId(id);

    const workSpace = await getWorkspace(workSpaceId, userId);

    if (!workSpace) {
      return NextResponse.json(
        {
          success: false,
          message: "Workspace not found or you are not a member.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched workspace.",
        workSpace,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[WORKSPACE_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch workspace. (error)",
      },
      { status: 500 }
    );
  }
}
