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
  const [lists, setLists] = useState(() => {
    const sortedLists = (board?.lists || []).sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
    return sortedLists;
  });
  const listsId = useMemo(() => lists.map((list) => list._id), [lists]);

  const [cards, setCards] = useState(() => {
    const allCards = [];
    board?.lists?.forEach((list) => {
      if (list.cards && list.cards.length > 0) {
        allCards.push(...list.cards);
      }
    });
    return allCards.sort((a, b) => (a.position || 0) - (b.position || 0));
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

  async function createCard(listId) {
    const tempId = generateId();
    const listCards = cards.filter((card) => card.listId === listId);
    const newPosition = getNextPosition(listCards);
    const newCard = {
      _id: tempId,
      title: `Card ${listCards.length + 1}`,
      listId,
      position: newPosition,
    };
    setCards([...cards, newCard]);

    try {
      const res = await axios.post("/api/cards", {
        ...newCard,
        _id: undefined,
      });
      const realId = res.data.card._id;
      setCards((prev) =>
        prev.map((c) => (c._id === tempId ? { ...c, _id: realId } : c))
      );
    } catch (error) {
      console.error("Error creating card:", error);
      console.error("Error creating card:", error?.response);
    }
  }

  async function deleteCard(id) {
    const previousCards = [...cards];
    const newCards = cards.filter((card) => card._id !== id);
    setCards(newCards);

    try {
      await axios.delete(`/api/cards`, { data: { id } });
    } catch (error) {
      console.error("Error deleting card:", error);
      setCards(previousCards);
    }
  }

  async function updateCard(id, title) {
    const previousCards = [...cards];

    const newCards = cards.map((card) =>
      card._id === id ? { ...card, title } : card
    );
    setCards(newCards);

    try {
      await axios.patch(`/api/cards`, { id, title });
    } catch (error) {
      console.error("Error updating card:", error);
      setCards(previousCards);
    }
  }

  async function createNewList() {
    const tempId = generateId();
    const newPosition = getNextPosition(lists);
    const listToAdd = {
      _id: tempId,
      name: `List ${lists.length + 1}`,
      boardId: board._id,
      position: newPosition,
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
      await axios.patch(`/api/lists`, { id, name, boardId: board._id });
    } catch (error) {
      console.error("Error updating list:", error);
      setLists(previousLists);
    }
  }

  // function onDragEnd(event) {
  //   setActiveList(null);
  //   setActiveCard(null);
  //   const { active, over } = event;
  //   if (!over) return;
  //   const activeId = active.id;
  //   const overId = over.id;
  //   if (activeId === overId) return;
  //   const isActiveAList = active.data.current?.type === "List";
  //   if (!isActiveAList) return;
  //   setLists((lists) => {
  //     const activeListIndex = lists.findIndex((list) => list._id === activeId);
  //     const overListIndex = lists.findIndex((list) => list._id === overId);
  //     return arrayMove(lists, activeListIndex, overListIndex);
  //   });
  // }

  // function onDragOver(event) {
  //   const { active, over } = event;
  //   if (!over) return;
  //   const activeId = active.id;
  //   const overId = over.id;
  //   if (activeId === overId) return;
  //   const isActiveACard = active.data.current?.type === "Card";
  //   const isOverACard = over.data.current?.type === "Card";
  //   if (!isActiveACard) return;
  //   if (isActiveACard && isOverACard) {
  //     setCards((cards) => {
  //       const activeIndex = cards.findIndex((card) => card._id === activeId);
  //       const overIndex = cards.findIndex((card) => card._id === overId);
  //       if (cards[activeIndex].listId != cards[overIndex].listId) {
  //         cards[activeIndex].listId = cards[overIndex].listId;
  //         return arrayMove(cards, activeIndex, overIndex - 1);
  //       }
  //       return arrayMove(cards, activeIndex, overIndex);
  //     });
  //   }

  //   const isOverAList = over.data.current?.type === "List";
  //   if (isActiveACard && isOverAList) {
  //     setCards((cards) => {
  //       const activeIndex = cards.findIndex((card) => card._id === activeId);
  //       cards[activeIndex].listId = overId;
  //       console.log("DROPPING CARD OVER LIST", { activeIndex });
  //       return arrayMove(cards, activeIndex, activeIndex);
  //     });
  //   }
  // }

  const POSITION_GAP = 1024; // Base gap between positions

  function getNextPosition(items) {
    if (items.length === 0) return POSITION_GAP;
    const maxPosition = Math.max(...items.map((item) => item.position || 0));
    return maxPosition + POSITION_GAP;
  }

  function getPositionBetween(beforePos, afterPos) {
    if (beforePos === undefined) return afterPos - POSITION_GAP / 2;
    if (afterPos === undefined) return beforePos + POSITION_GAP;
    return (beforePos + afterPos) / 2;
  }

  async function updateListPositions(movedList, newIndex, allLists) {
    try {
      console.log("[v0] Updating list positions", {
        movedList: movedList._id,
        newIndex,
      });

      let newPosition;

      if (newIndex === 0) {
        // Moving to first position
        const nextList = allLists[1];
        newPosition = nextList
          ? nextList.position - POSITION_GAP / 2
          : POSITION_GAP;
      } else if (newIndex === allLists.length - 1) {
        // Moving to last position
        const prevList = allLists[newIndex - 1];
        newPosition = prevList.position + POSITION_GAP;
      } else {
        // Moving between items
        const prevList = allLists[newIndex - 1];
        const nextList = allLists[newIndex + 1];
        newPosition = getPositionBetween(prevList.position, nextList.position);
      }

      console.log("[v0] Calculated new position", { newPosition });

      await axios.patch("/api/lists/positions", {
        boardId: board._id,
        updates: [
          {
            id: movedList._id,
            position: newPosition,
          },
        ],
      });

      // Update local state and re-sort
      setLists((prev) => {
        const updated = prev.map((list) =>
          list._id === movedList._id ? { ...list, position: newPosition } : list
        );
        return updated.sort((a, b) => a.position - b.position);
      });

      console.log("[v0] List positions updated successfully");
    } catch (error) {
      console.error("Error updating list positions:", error);
      customToast.error("Failed to save list positions");
    }
  }

  async function updateCardPositions(
    movedCard,
    newIndex,
    targetListId,
    cardsInTargetList
  ) {
    try {
      console.log("[v0] Updating card positions", {
        movedCard: movedCard._id,
        newIndex,
        targetListId,
        cardsInList: cardsInTargetList.length,
      });

      let newPosition;

      if (cardsInTargetList.length === 0) {
        // First card in empty list
        newPosition = POSITION_GAP;
      } else if (newIndex === 0) {
        // Moving to first position
        const nextCard = cardsInTargetList[0];
        newPosition = nextCard.position - POSITION_GAP / 2;
      } else if (newIndex >= cardsInTargetList.length) {
        // Moving to last position
        const lastCard = cardsInTargetList[cardsInTargetList.length - 1];
        newPosition = lastCard.position + POSITION_GAP;
      } else {
        // Moving between items
        const prevCard = cardsInTargetList[newIndex - 1];
        const nextCard = cardsInTargetList[newIndex];
        newPosition = getPositionBetween(prevCard.position, nextCard.position);
      }

      console.log("[v0] Calculated new card position", { newPosition });

      await axios.patch("/api/cards/positions", {
        updates: [
          {
            id: movedCard._id,
            position: newPosition,
            listId: targetListId,
          },
        ],
      });

      // Update local state and re-sort
      setCards((prev) => {
        const updated = prev.map((card) =>
          card._id === movedCard._id
            ? { ...card, position: newPosition, listId: targetListId }
            : card
        );
        return updated.sort((a, b) => a.position - b.position);
      });

      console.log("[v0] Card positions updated successfully");
    } catch (error) {
      console.error("Error updating card positions:", error);
      customToast.error("Failed to save card positions");
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

    const activeListIndex = lists.findIndex((list) => list._id === activeId);
    const overListIndex = lists.findIndex((list) => list._id === overId);

    if (activeListIndex === -1 || overListIndex === -1) return;

    const reorderedLists = arrayMove(lists, activeListIndex, overListIndex);
    const movedList = lists[activeListIndex];

    // Update UI immediately
    setLists(reorderedLists);

    // Save to database
    updateListPositions(movedList, overListIndex, reorderedLists);
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
      const activeCard = cards.find((card) => card._id === activeId);
      const overCard = cards.find((card) => card._id === overId);

      if (!activeCard || !overCard) return;

      const targetListId = overCard.listId;
      const cardsInTargetList = cards
        .filter((card) => card.listId === targetListId && card._id !== activeId)
        .sort((a, b) => a.position - b.position);

      const overCardIndex = cardsInTargetList.findIndex(
        (card) => card._id === overId
      );
      const newIndex =
        overCardIndex >= 0 ? overCardIndex : cardsInTargetList.length;

      // Update UI immediately
      setCards((prev) => {
        const updated = prev.map((card) =>
          card._id === activeId ? { ...card, listId: targetListId } : card
        );
        return updated.sort((a, b) => a.position - b.position);
      });

      // Save to database
      updateCardPositions(
        activeCard,
        newIndex,
        targetListId,
        cardsInTargetList
      );
    }

    const isOverAList = over.data.current?.type === "List";
    if (isActiveACard && isOverAList) {
      const activeCard = cards.find((card) => card._id === activeId);
      if (!activeCard) return;

      const targetListId = overId;
      const cardsInTargetList = cards
        .filter((card) => card.listId === targetListId)
        .sort((a, b) => a.position - b.position);

      // Update UI immediately
      setCards((prev) => {
        const updated = prev.map((card) =>
          card._id === activeId ? { ...card, listId: targetListId } : card
        );
        return updated.sort((a, b) => a.position - b.position);
      });

      // Save to database (append to end of list)
      updateCardPositions(
        activeCard,
        cardsInTargetList.length,
        targetListId,
        cardsInTargetList
      );
    }
  }

  return (
    <>
      <header className="select-none px-4">
        <nav className="px-0 sm:px-6 pb-2 md:pb-0 pt-4 xl:pt-7 flex items-center justify-between">
          <div
            onClick={() => router.back()}
            className="flex items-center gap-x-1 xl:gap-x-2 text-h5 cursor-pointer"
          >
            <ArrowLeft size={25} />
            Back
          </div>

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
