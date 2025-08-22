"use client";
import { useState } from "react";
import { Trash } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardModal from "./CardModal";

function CardItem({ card, deleteCard, updateCard, boardId }) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localCard,setLocalCard] = useState(card);
  // const[cardName, setCardName] = useState(card.title);
  const [showModal, setShowModal] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
    data: {
      type: "Card",
      card,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    updateCard(card._id, localCard.title);
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const getPriorityClass = () => {
    switch (localCard.priority) {
      case "high":
        return "bg-red-100 hover:ring-red-300";
      case "low":
        return "bg-green-100 hover:ring-green-300";
      default:
        return "bg-gray-100 hover:ring-gray-300";
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-gray-200 p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl  cursor-grab relative"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-gray-50 p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-blue-500 cursor-grab relative"
      >
        <textarea
          className="h-[90%] text-black w-full resize-none border-none rounded bg-transparent  focus:outline-none"
          value={localCard.title}
          autoFocus
          placeholder="Card content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
          onChange={(e) => setLocalCard({...localCard, title: e.target.value})}
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
        className={`p-2.5 max-h-52  min-h-14 items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset cursor-grab relative ${getPriorityClass()}`}
        data-type="card"
        data-id={card._id}
        onMouseEnter={() => {
          setMouseIsOver(true);
        }}
        onMouseLeave={() => {
          setMouseIsOver(false);
        }}
      >
        <p className="my-auto h-[90%] w-full ">{localCard.title}</p>

        {mouseIsOver && (
          <button
            className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              deleteCard(card._id);
            }}
          >
            <Trash className="text-red-600 font-bold" />
          </button>
        )}
      </div>

      {showModal && (
        <CardModal
          setLocalCard={setLocalCard}
          card={localCard}
          boardId={boardId}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            // The card will be updated via real-time events
          }}
        />
      )}
    </>
  );
}

export default CardItem;
