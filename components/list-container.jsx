"use client";
import { useMemo, useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash, Plus } from "lucide-react";
import CardItem from "./card-item";

function ListContainer({
  list,
  deleteList,
  updateList,
  createCard,
  deleteCard,
  updateCard,
  cards,
  boardId,
  onCardUpdated,
}) {
  const [editMode, setEditMode] = useState(false);
  const [listName, setListName] = useState(list.name);

  const cardsIds = useMemo(() => {
    return cards.map((card) => card._id);
  }, [cards]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list._id,
    data: {
      type: "List",
      list,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-blue-50 opacity-40 w-[300px] h-[600px]  rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="  w-[300px]  h-[600px] bg-white border-gray-200 border-2 rounded-md flex flex-col p-2"
      data-type="list"
      data-id={list._id}
    >
      {/* List header */}
      <div
        {...attributes}
        {...listeners}
        className=" h-14 cursor-grab rounded-md px-2 font-bold  flex items-center justify-between hover:bg-blue-50 transition-all duration-200 ease-out"
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="flex justify-center items-center bg-blue-300 px-2 py-1  rounded-full">
            {cards.length}
          </div>
          {!editMode && (
            <div
              className="cursor-pointer line-clamp-1"
              onClick={() => setEditMode(true)}
            >
              {listName}
            </div>
          )}
          {editMode && (
            <input
              className="bg-white focus:border-blue-500 w-[150px] px-1 border rounded outline-none "
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              autoFocus
              onBlur={() => {updateList(list._id, listName); setEditMode(false)}}
              onKeyDown={(e) => {
                if (e.key === "Enter") {updateList(list._id, listName); setEditMode(false);}
              }}
            />
          )}
        </div>
        <button
          onClick={() => {
            deleteList(list._id);
          }}
          className=""
        >
          <Trash size={20} className="hover:text-red-500" />
        </button>
      </div>

      <div className="flex  flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={cardsIds}>
          {cards.map((card) => (
            <CardItem
              key={card._id}
              card={card}
              deleteCard={deleteCard}
              updateCard={updateCard}
              boardId={boardId}
            />
          ))}
        </SortableContext>
      </div>

      <button
        className="flex gap-2 items-center bg-blue-50 rounded-md p-4  hover:bg-blue-100 hover:text-blue-600 "
        onClick={() => {
          createCard(list._id);
        }}
      >
        <Plus />
        Add card
      </button>
    </div>
  );
}

export default ListContainer;
