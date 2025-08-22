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
import ActivityLog from "./ActivityLog";
import { Activity as ActivityIcon } from "lucide-react";

const KanbanBoard = ({ serializedBoard }) => {
  const router = useRouter();

  // Board state management
  const [board, setBoard] = useState(serializedBoard);
  const [boardNameEditing, setBoardNameEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [render, setRender] = useState(false);
  
  // Lists state - sorted by position for consistent ordering
  const [lists, setLists] = useState(() => {
    const sortedLists = (board?.lists || []).sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
    return sortedLists;
  });
  
  // Memoized list IDs for drag-and-drop context
  const listsId = useMemo(() => lists.map((list) => list._id), [lists]);

  // Cards state - flattened from all lists and deduplicated
  const [cards, setCards] = useState(() => {
    const allCards = [];
    board?.lists?.forEach((list) => {
      if (list.cards && list.cards.length > 0) {
        allCards.push(...list.cards);
      }
    });
    // Ensure unique by _id to prevent duplicates
    const map = new Map();
    for (const c of allCards) if (!map.has(c._id)) map.set(c._id, c);
    return Array.from(map.values()).sort((a, b) => (a.position || 0) - (b.position || 0));
  });

  // Drag-and-drop state
  const [activeList, setActiveList] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  
  // UI state
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Drag sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Minimum drag distance to activate
      },
    })
  );

  // Initialize component and get current user from JWT
  useEffect(() => {
    setRender(true);
    // Extract user info from JWT token stored in cookies
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('=')[1].split('.')[1]));
        console.log('Current user from token:', payload);
        setCurrentUser(payload);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, []);

 
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

  
  function setCardsUnique(updater) {
    setCards((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const map = new Map();
      for (const c of next) if (!map.has(c._id)) map.set(c._id, c);
      return Array.from(map.values()).sort((a, b) => (a.position || 0) - (b.position || 0));
    });
  }

 
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
    setCardsUnique([...cards, newCard]);

    try {
      const res = await axios.post("/api/cards", {
        ...newCard,
        _id: undefined,
      });
      const realId = res.data.card._id;
      setCardsUnique((prev) =>
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
    setCardsUnique(newCards);

    try {
      await axios.delete(`/api/cards`, { data: { id } });
    } catch (error) {
      console.error("Error deleting card:", error);
      setCardsUnique(previousCards);
    }
  }


  async function updateCard(id, title) {
    const previousCards = [...cards];

    const newCards = cards.map((card) =>
      card._id === id ? { ...card, title } : card
    );
    setCardsUnique(newCards);

    try {
      await axios.patch(`/api/cards`, { id, title });
    } catch (error) {
      console.error("Error updating card:", error);
      setCardsUnique(previousCards);
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
    setCardsUnique(newCards);

    try {
      await axios.delete(`/api/lists`, { data: { id, boardId: board._id } });
    } catch (error) {
      console.error("Error deleting list:", error);
      setLists(previousLists);
      setCardsUnique(previousCards);
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

  // Position management constants
  const POSITION_GAP = 1024; // Base gap between positions for smooth reordering

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
      // Calculate new position based on surrounding lists
      let newPosition;
      if (newIndex === 0) {
        // Moving to the beginning
        const nextList = allLists[1];
        newPosition = nextList ? nextList.position - POSITION_GAP / 2 : POSITION_GAP;
      } else if (newIndex === allLists.length - 1) {
        // Moving to the end
        const prevList = allLists[newIndex - 1];
        newPosition = prevList.position + POSITION_GAP;
      } else {
        // Moving between two lists
        const prevList = allLists[newIndex - 1];
        const nextList = allLists[newIndex + 1];
        newPosition = getPositionBetween(prevList.position, nextList.position);
      }

      await axios.patch("/api/lists/positions", {
        boardId: board._id,
        updates: [
          {
            id: movedList._id,
            position: newPosition,
          },
        ],
      });

      // Don't update local state here - let SSE handle it to prevent conflicts
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
      // Calculate new position based on target location
      let newPosition;
      if (cardsInTargetList.length === 0) {
        // Moving to empty list
        newPosition = POSITION_GAP;
      } else if (newIndex === 0) {
        // Moving to the beginning of the list
        const nextCard = cardsInTargetList[0];
        newPosition = nextCard.position - POSITION_GAP / 2;
      } else if (newIndex >= cardsInTargetList.length) {
        // Moving to the end of the list
        const lastCard = cardsInTargetList[cardsInTargetList.length - 1];
        newPosition = lastCard.position + POSITION_GAP;
      } else {
        // Moving between two cards
        const prevCard = cardsInTargetList[newIndex - 1];
        const nextCard = cardsInTargetList[newIndex];
        newPosition = getPositionBetween(prevCard.position, nextCard.position);
      }

      await axios.patch("/api/cards/positions", {
        updates: [
          {
            id: movedCard._id,
            position: newPosition,
            listId: targetListId,
          },
        ],
      });

      // Don't update local state here - let SSE handle it to prevent conflicts
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

    setLists(reorderedLists);
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

    // Card dropped on another card
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

      // Update local state immediately for smooth UX (only listId, not position)
      setCardsUnique((prev) => {
        const updated = prev.map((card) =>
          card._id === activeId ? { ...card, listId: targetListId } : card
        );
        return updated;
      });

      // Send position update to server
      updateCardPositions(
        activeCard,
        newIndex,
        targetListId,
        cardsInTargetList
      );
    }

    // Card dropped on a list
    const isOverAList = over.data.current?.type === "List";
    if (isActiveACard && isOverAList) {
      const activeCard = cards.find((card) => card._id === activeId);
      if (!activeCard) return;

      const targetListId = overId;
      const cardsInTargetList = cards
        .filter((card) => card.listId === targetListId)
        .sort((a, b) => a.position - b.position);

      // Update local state immediately (only listId, not position)
      setCardsUnique((prev) => {
        const updated = prev.map((card) =>
          card._id === activeId ? { ...card, listId: targetListId } : card
        );
        return updated;
      });

      // Send position update to server
      updateCardPositions(
        activeCard,
        cardsInTargetList.length,
        targetListId,
        cardsInTargetList
      );
    }
  }

  /**
   * Real-time updates via Server-Sent Events (SSE)
   * Listens for changes from other users and updates local state
   */
  useEffect(() => {
    if (!board?._id) return;
    
    console.log('Connecting to SSE for board:', board._id);
    const es = new EventSource(`/api/boards/${board._id}/sse`);
    
    es.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      try {
        const data = JSON.parse(event.data || "null");
        if (!data || !data.type) return;
        
        switch (data.type) {
          case "list.created": {
            setLists((prev) => {
              const exists = prev.some((l) => l._id === data.list._id);
              if (exists) return prev;
              return [...prev, data.list].sort((a, b) => a.position - b.position);
            });
            break;
          }
          case "list.updated": {
            setLists((prev) =>
              prev.map((l) => (l._id === data.list._id ? { ...l, ...data.list } : l))
            );
            break;
          }
          case "list.deleted": {
            setLists((prev) => prev.filter((l) => l._id !== data.listId));
            setCardsUnique((prev) => prev.filter((c) => c.listId !== data.listId));
            break;
          }
          case "card.created": {
            setCardsUnique((prev) => {
              const exists = prev.some((c) => c._id === data.card._id);
              if (exists) return prev;
              return [...prev, data.card];
            });
            break;
          }
          case "card.updated": {
            setCardsUnique((prev) =>
              prev.map((c) => (c._id === data.id ? { ...c, title: data.title } : c))
            );
            break;
          }
          case "card.deleted": {
            setCardsUnique((prev) => prev.filter((c) => c._id !== data.id));
            break;
          }
          case "card.positions": {
            setCardsUnique((prev) => {
              const map = new Map(prev.map((c) => [c._id, c]));
              for (const u of data.updates) {
                if (map.has(u.id)) {
                  const curr = map.get(u.id);
                  map.set(u.id, { ...curr, position: u.position, listId: u.listId ?? curr.listId });
                }
              }
              return Array.from(map.values());
            });
            break;
          }
          case "list.positions": {
            setLists((prev) => {
              const map = new Map(prev.map((l) => [l._id, l]));
              for (const u of data.updates) {
                if (map.has(u.id)) {
                  const curr = map.get(u.id);
                  map.set(u.id, { ...curr, position: u.position });
                }
              }
              return Array.from(map.values()).sort((a, b) => a.position - b.position);
            });
            break;
          }

          case "activity": {
            // Show toast notifications for other users' activities
            if (data?.userFullName && data?.action) {
              try {
                // Check if this activity is from the current user
                const currentUserId = currentUser?.id?.toString();
                const activityUserId = data.userId?.toString();
                const isCurrentUser = currentUserId && activityUserId && currentUserId === activityUserId;
                
                console.log('Activity check:', {
                  currentUserId,
                  activityUserId,
                  isCurrentUser,
                  currentUser: currentUser,
                  data: data
                });
                
                
                
                // Only show toast for other users' activities
                if (!isCurrentUser) {
                  let msg = "";
                  
                  // Create specific messages based on action type
                  switch (data.action) {
                    case "comment.created":
                      msg = `${data.userFullName} commented on a card`;
                      break;
                    case "card.created":
                      msg = `${data.userFullName} created a card`;
                      break;
                    case "card.updated":
                      msg = `${data.userFullName} updated a card`;
                      break;
                    case "card.deleted":
                      msg = `${data.userFullName} deleted a card`;
                      break;
                    case "card.moved":
                      msg = `${data.userFullName} moved a card`;
                      break;
                    case "list.created":
                      msg = `${data.userFullName} created a list`;
                      break;
                    case "list.updated":
                      msg = `${data.userFullName} updated a list`;
                      break;
                    case "list.deleted":
                      msg = `${data.userFullName} deleted a list`;
                      break;
                    case "list.moved":
                      msg = `${data.userFullName} moved a list`;
                      break;
                    case "board.updated":
                      msg = `${data.userFullName} updated the board`;
                      break;
                    default:
                      msg = `${data.userFullName} ${data.action.replace('.', ' ')}`;
                  }
                  
                  customToast.success(msg);
                }
              } catch {}
            }
            break;
          }
          default:
            break;
        }
      } catch {}
    };
    
    es.onerror = () => {
      es.close();
    };
    
    return () => es.close();
  }, [board?._id, currentUser]);

  return (
    <>
      {/* Header with board name editing and activity log */}
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

          <div className="flex items-center gap-2">
                         <button
               onClick={() => setShowActivityLog(true)}
               className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
             >
               <ActivityIcon size={16} />
               Activity
             </button>
             
            <LogoutButton />
          </div>
        </nav>
      </header>

      {/* Main board area with drag-and-drop context */}
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
                    boardId={board._id}
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
          
          {/* Drag overlay for visual feedback during dragging */}
          {render && typeof document !== 'undefined' ? (
            createPortal(
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
                    boardId={board._id}
                    onCardUpdated={(updated) => setCardsUnique((prev) => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c))}
                  />
                )}
              </DragOverlay>,
              document.body
            )
          ) : null}
        </DndContext>
      </main>

      <ActivityLog
        boardId={board._id}
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
      />
    </>
  );
};

/**
 * Generate unique IDs for optimistic updates
 * Uses crypto.randomUUID() for collision resistance
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default KanbanBoard;
