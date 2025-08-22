import { User } from "@/models/User";
import { WorkSpace } from "@/models/Workspace";
import { connectToDB } from "@/services/connectdb";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const { email, workSpaceId } = await request.json();

    if (!email || !workSpaceId) {
      return NextResponse.json(
        { success: false, message: "Email and workspace ID are required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found with this email" },
        { status: 404 }
      );
    }

    // Find the workspace
    const workspace = await WorkSpace.findById(workSpaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(
      (member: any) => member.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User is already a member of this workspace",
        },
        { status: 400 }
      );
    }

    // Add user to workspace members
    workspace.members.push(user._id);
    await workspace.save();

    revalidateTag(`workspace-${user._id}`);

    return NextResponse.json(
      { success: true, message: "Member invited successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDB();

    const { memberId, workSpaceId } = await request.json();

    if (!memberId || !workSpaceId) {
      return NextResponse.json(
        { success: false, message: "Member ID and workspace ID are required" },
        { status: 400 }
      );
    }

    // Find the workspace
    const workspace = await WorkSpace.findById(workSpaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if member exists in workspace
    const memberIndex = workspace.members.findIndex(
      (member: any) => member.toString() === memberId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Member not found in workspace" },
        { status: 404 }
      );
    }

    // Remove member from workspace
    workspace.members.splice(memberIndex, 1);
    await workspace.save();

    revalidateTag(`workspace-${memberId}`);

    return NextResponse.json(
      { success: true, message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
