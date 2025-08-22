import { NextResponse } from "next/server";
import { connectToDB } from "@/services/connectdb";
import verifyToken from "@/app/api/verifyToken";
import { Comment } from "@/models/Comment";
import { Card } from "@/models/Card";
import { List } from "@/models/List";
import { Board } from "@/models/Board";
import { WorkSpace } from "@/models/Workspace";
import mongoose from "mongoose";
import { broadcastActivity, broadcastCommentCreated } from "@/services/realtime";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await context.params;

    const comments = await Comment.find({ cardId: id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await context.params; // cardId

    const user = await verifyToken();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    const trimmed = (text || "").trim();
    if (!trimmed) {
      return NextResponse.json({ success: false, message: "Empty comment" }, { status: 400 });
    }

    const card = await Card.findById(id).populate({ path: "listId" });
    if (!card || !card.listId) {
      return NextResponse.json({ success: false, message: "Card not found" }, { status: 404 });
    }

    const board = await Board.findById(card.listId.boardId);
    const workSpace = await WorkSpace.findById(board.workSpaceId);
    const userId = new mongoose.Types.ObjectId(user.id);
    const isMember = workSpace.members.some((m: any) => m.equals ? m.equals(userId) : m.toString() === user.id);
    if (!isMember) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const created = await Comment.create({
      cardId: id,
      authorId: userId,
      authorFullName: user.fullName,
      text: trimmed,
    });

    try {
      broadcastActivity(board._id.toString(), user.id, user.fullName, "comment.created", { comment: true });
      broadcastCommentCreated(board._id.toString(), id, created);
    } catch {}

    return NextResponse.json({ success: true, comment: created }, { status: 201 });
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
  }
}
