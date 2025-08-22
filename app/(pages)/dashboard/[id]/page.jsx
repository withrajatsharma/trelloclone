
import { notFound } from "next/navigation";
import React from "react";
import KanbanBoard from "@/components/KanbanBoard";
import { getBoard } from "@/app/api/board/[id]/route";
import mongoose from "mongoose";

const page = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return notFound();
  }

  const board = await getBoard(new mongoose.Types.ObjectId(id));

  const serializedBoard = JSON.parse(JSON.stringify(board));

  return (
    <>
     

      <main className="flex-1 overflow-hidden">
        <KanbanBoard serializedBoard={serializedBoard} />
      </main>
    </>
  );
};

export default page;
