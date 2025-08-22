import { User } from "@/models/User";
import { Board } from "@/models/Board";
import { WorkSpace } from "@/models/Workspace";
import { connectToDB } from "@/services/connectdb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import verifyToken from "../../verifyToken";
import { revalidateTag } from "next/cache";
import { List } from "@/models/List";
import { Card } from "@/models/Card";

export async function getBoard(id: mongoose.Types.ObjectId) {
  try {
    await connectToDB();

    const board = await Board.findById(id);
    if (!board) {
      return null;
    }

    const lists = await List.find({ boardId: id }).sort({ position: 1 });
    const cards = await Card.find({
      listId: { $in: lists.map((l) => l._id) },
    }).sort({ position: 1 });

    const boardWithLists = {
      ...board.toObject(),
      id: board._id.toString(),
      lists: lists.map((list) => ({
        ...list.toObject(),
        id: list._id.toString(),
        cards: cards
          .filter((card) => card.listId.toString() === list._id.toString())
          .map((card) => ({
            ...card.toObject(),
            id: card._id.toString(),
          })),
      })),
    };

    return boardWithLists;
  } catch (error) {
    console.error("[BOARD_GET_ERROR]", error);
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

    const boardId = new mongoose.Types.ObjectId(id);

    const board = await getBoard(boardId);

    if (!board) {
      return NextResponse.json(
        {
          success: false,
          message: "Board not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched board.",
        board,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[BOARD_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch board. (error)",
      },
      { status: 500 }
    );
  }
}
