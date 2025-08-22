import { eventBus } from '../lib/eventBus';


function emitBoardEvent(boardId, event) {
  eventBus.emit(`board:${boardId}`, event);
}


export function broadcastListCreated(boardId, list) {
  emitBoardEvent(boardId.toString(), {
    type: "list.created",
    list,
  });
}

export function broadcastListDeleted(boardId, listId) {
  emitBoardEvent(boardId.toString(), {
    type: "list.deleted",
    listId,
  });
}

export function broadcastListUpdated(boardId, list) {
  emitBoardEvent(boardId.toString(), {
    type: "list.updated",
    list,
  });
}


export function broadcastCardCreated(boardId, card) {
  emitBoardEvent(boardId.toString(), {
    type: "card.created",
    card,
  });
}

export function broadcastCardDeleted(boardId, cardId) {
  emitBoardEvent(boardId.toString(), {
    type: "card.deleted",
    id: cardId,
  });
}


export function broadcastCardUpdated(boardId, cardId, title) {
  emitBoardEvent(boardId.toString(), {
    type: "card.updated",
    id: cardId,
    title,
  });
}


export function broadcastListPositions(boardId, updates) {
  emitBoardEvent(boardId.toString(), {
    type: "list.positions",
    updates,
  });
}

export function broadcastCardPositions(boardId, updates) {
  emitBoardEvent(boardId.toString(), {
    type: "card.positions",
    updates,
  });
}




export function broadcastActivity(boardId, userId, userFullName, action, details = {}) {
  emitBoardEvent(boardId.toString(), {
    type: "activity",
    userId,
    userFullName,
    action,
    details,
  });
}

export function broadcastCommentCreated(boardId, cardId, comment) {
  emitBoardEvent(boardId.toString(), {
    type: "comment.created",
    cardId,
    comment,
  });
}


