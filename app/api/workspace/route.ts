import { connectToDB } from "@/services/connectdb";
import { NextResponse } from "next/server";
import verifyToken from "../verifyToken";
import mongoose from "mongoose";
import { WorkSpace } from "@/models/Workspace";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name } = await req.json();
    const trimmedName = (name || "").trim().toLowerCase();

    if (!trimmedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a workspace name.",
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

    const existing = await WorkSpace.findOne({
      name: trimmedName,
      ownerId: userId,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You already own a workspace with this name.",
        },
        { status: 400 }
      );
    }

    const workspace = await WorkSpace.create({
      name: trimmedName,
      ownerId: userId,
      members: [userId],
    });

    revalidateTag("workspaces");

    return NextResponse.json(
      {
        success: true,
        message: "Workspace created successfully.",
        workspace: {
          id: workspace._id,
          name: workspace.name,
          owner: userId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[WORKSPACE_CREATE_API] : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create workspace. (error)",
      },
      { status: 500 }
    );
  }
}

export const getUserWorkspaces = async (userId: mongoose.Types.ObjectId) => {
  try {
    await connectToDB();

    const workSpaces = await WorkSpace.find({
      members: userId,
    })
      .select("_id name ownerId")
      .lean();

    return workSpaces || [];
  } catch (error) {
    console.log(`Error fetching workspaces:`, error);
    return [];
  }
};

export async function GET(request: Request) {
  try {
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

    const workSpaces = await getUserWorkspaces(userId);

    if (!workSpaces) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have any workspaces.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Workspace created successfully.",
        workSpaces,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[WORKSPACE_CREATE_API] : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create workspace. (error)",
      },
      { status: 500 }
    );
  }
}
