"use client";
import {
  ArrowLeft,
  Edit,
  FolderKanban,
  PlusSquareIcon,
  Save,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import ListContainer from "./list-container";
import { createPortal } from "react-dom";
import CardItem from "./card-item";
import { customToast } from "./CustomToast";
import LogoutButton from "./LogoutButton";

const KanbanBoard = ({ serializedBoard }) => {
  const router = useRouter();

  const [board, setBoard] = useState(serializedBoard);
  const [boardNameEditing, setBoardNameEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log(`serializedBoard:`, serializedBoard);

  const [render, setRender] = useState(false);
  const [lists, setLists] = useState(board?.lists || []);
  const listsId = useMemo(() => lists.map((list) => list._id), [lists]);

  const [cards, setCards] = useState(() => {
    const allCards = [];
    board?.lists?.forEach((list) => {
      if (list.cards && list.cards.length > 0) {
        allCards.push(...list.cards);
      }
    });
    return allCards;
  });

  const [activeList, setActiveList] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  const handleSaveBoardName = async () => {
    if (board.name.trim() === "" || board.name.trim() === serializedBoard?.name)
      return;

    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await axios.patch(`/api/board/`, {
        name: board.name.trim(),
        boardId: board._id,
      });
      if (res && res?.data && res?.data?.success) {
        customToast.success(
          res?.data?.message || "board updated successfully!"
        );
        router.refresh();
        setBoardNameEditing(false);
      } else {
        customToast.error(res?.data?.message || "Failed to update board name.");
      }
    } catch (error) {
      setBoardNameEditing(false);
      setBoard({ ...board, name: serializedBoard.name });
      console.log("Error updating board:", error?.message);
      console.log(`error :`, error?.response);
      customToast.error(
        error?.response?.data?.message ||
          "Please try again. (board update error)"
      );
    } finally {
      setIsLoading(false);
    }
  };

  function createCard(listId) {
    const newCard = {
      _id: generateId(),
      listId,
      title: `Card ${cards.length + 1}`,
      description: "",
      position: cards.filter((card) => card.listId === listId).length,
    };
    setCards([...cards, newCard]);

    // API call to create card in database
    axios.post("/api/cards", newCard).catch(console.error);
  }

  function deleteCard(id) {
    const newCards = cards.filter((card) => card._id !== id);
    setCards(newCards);

    // API call to delete card from database
    axios.delete(`/api/cards/${id}`).catch(console.error);
  }

  function updateCard(id, title) {
    const newCards = cards.map((card) => {
      if (card._id !== id) return card;
      return { ...card, title };
    });
    setCards(newCards);

    // API call to update card in database
    axios.patch(`/api/cards/${id}`, { title }).catch(console.error);
  }

  async function createNewList() {
    const tempId = generateId();
    const listToAdd = {
      _id: tempId,
      name: `List ${lists.length + 1}`,
      boardId: board._id,
      position: lists.length,
    };
    setLists([...lists, listToAdd]);

    try {
      const res = await axios.post("/api/lists", {
        ...listToAdd,
        _id: undefined,
      });
      const realId = res.data.list._id;
      setLists((prev) =>
        prev.map((l) => (l._id === tempId ? { ...l, _id: realId } : l))
      );
    } catch (error) {
      console.error("Error creating list:", error);
      console.error("Error creating list:", error?.response);
    }
  }


  async function deleteList(id) {
  const previousLists = [...lists];
  const previousCards = [...cards];

  const filteredLists = lists.filter((list) => list._id !== id);
  setLists(filteredLists);
  const newCards = cards.filter((card) => card.listId !== id);
  setCards(newCards);

  try {
    await axios.delete(`/api/lists`, { data: { id, boardId: board._id } }); 
  } catch (error) {
    console.error("Error deleting list:", error);
    setLists(previousLists);
    setCards(previousCards);
  }
}

async function updateList(id, name) {
  const previousLists = [...lists];

  const newLists = lists.map((list) =>
    list._id === id ? { ...list, name } : list
  );
  setLists(newLists);

  try {
    await axios.patch(`/api/lists`, { id, name ,boardId: board._id });
  } catch (error) {
    console.error("Error updating list:", error);
    setLists(previousLists);
  }
}


  function onDragStart(event) {
    if (event.active.data.current?.type === "List") {
      setActiveList(event.active.data.current.list);
      return;
    }

    if (event.active.data.current?.type === "Card") {
      setActiveCard(event.active.data.current.card);
      return;
    }
  }

  function onDragEnd(event) {
    setActiveList(null);
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const isActiveAList = active.data.current?.type === "List";
    if (!isActiveAList) return;
    setLists((lists) => {
      const activeListIndex = lists.findIndex((list) => list._id === activeId);
      const overListIndex = lists.findIndex((list) => list._id === overId);
      return arrayMove(lists, activeListIndex, overListIndex);
    });
  }

  function onDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const isActiveACard = active.data.current?.type === "Card";
    const isOverACard = over.data.current?.type === "Card";
    if (!isActiveACard) return;
    if (isActiveACard && isOverACard) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((card) => card._id === activeId);
        const overIndex = cards.findIndex((card) => card._id === overId);
        if (cards[activeIndex].listId != cards[overIndex].listId) {
          cards[activeIndex].listId = cards[overIndex].listId;
          return arrayMove(cards, activeIndex, overIndex - 1);
        }
        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    const isOverAList = over.data.current?.type === "List";
    if (isActiveACard && isOverAList) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((card) => card._id === activeId);
        cards[activeIndex].listId = overId;
        console.log("DROPPING CARD OVER LIST", { activeIndex });
        return arrayMove(cards, activeIndex, activeIndex);
      });
    }
  }

  return (
    <>
      <header className="select-none px-4">
        <nav className="px-0 sm:px-6 pb-2 md:pb-0 pt-4 xl:pt-7 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-x-1 xl:gap-x-2 text-h5"
          >
            <ArrowLeft size={25} />
            Back
          </Link>

          <div className="flex items-center gap-3 w-fit relative ">
            {boardNameEditing ? (
              <input
                className="text-h4 font-semibold border-none outline-none underline w-[400px] text-center"
                value={board.name}
                onChange={(e) => setBoard({ ...board, name: e.target.value })}
                onBlur={handleSaveBoardName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveBoardName()}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-3 w-fit relative">
                <FolderKanban size={30} />
                <h1 className="text-h4 ">{board.name}</h1>
              </div>
            )}

            {!boardNameEditing ? (
              <Edit
                className="absolute -right-6 top-0 cursor-pointer"
                size={15}
                onClick={() => setBoardNameEditing(true)}
              />
            ) : (
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2 animate-spin" />
                ) : (
                  <Save
                    onClick={handleSaveBoardName}
                    className=" cursor-pointer text-green-500"
                    size={30}
                  />
                )}

                <X
                  className=" cursor-pointer text-black"
                  size={30}
                  onClick={() => {
                    setBoardNameEditing(false);
                    setBoard({ ...board, name: serializedBoard.name });
                  }}
                />
              </div>
            )}
          </div>

          <LogoutButton />
        </nav>
      </header>

      <main className=" pt-10  min-h-screen w-full overflow-x-auto overflow-y-hidden px-[40px] pr-[100px] ">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4">
              <SortableContext items={listsId}>
                {lists.map((list) => (
                  <ListContainer
                    key={list._id}
                    list={list}
                    deleteList={deleteList}
                    updateList={updateList}
                    createCard={createCard}
                    deleteCard={deleteCard}
                    updateCard={updateCard}
                    cards={cards.filter((card) => card.listId === list._id)}
                  />
                ))}
              </SortableContext>
            </div>
            <button
              onClick={() => {
                createNewList();
              }}
              className=" h-[60px] mr-20 w-[300px] m-2 min-w-[300px] cursor-pointer rounded-lg bg-blue-50  p-4 ring-blue-500 hover:ring-2 flex gap-2 "
            >
              <PlusSquareIcon />
              Add List
            </button>
            <div className="min-w-10" />
          </div>
          {createPortal(
            <DragOverlay>
              {activeList && (
                <ListContainer
                  list={activeList}
                  deleteList={deleteList}
                  updateList={updateList}
                  createCard={createCard}
                  deleteCard={deleteCard}
                  updateCard={updateCard}
                  cards={cards.filter((card) => card.listId === activeList._id)}
                />
              )}
              {activeCard && (
                <CardItem
                  card={activeCard}
                  deleteCard={deleteCard}
                  updateCard={updateCard}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </main>
    </>
  );
};

function generateId() {
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
