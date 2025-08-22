import { eventBus } from '../lib/eventBus';

/**
 * Real-time Broadcasting Service
 * 
 * This service provides functions to broadcast real-time events to all connected clients
 * for a specific board. It uses an in-memory event bus to manage subscribers and
 * broadcast events via Server-Sent Events (SSE).
 * 
 * Architecture:
 * - Event Bus: Central hub for managing subscribers and broadcasting events
 * - SSE Streams: Each board has its own SSE stream for real-time updates
 * - Event Types: Different event types for different actions (CRUD operations, positions, etc.)
 */

/**
 * Emit an event to all subscribers of a specific board
 * @param {string} boardId - The board ID to broadcast to
 * @param {Object} event - The event object to broadcast
 */
function emitBoardEvent(boardId, event) {
  eventBus.emit(`board:${boardId}`, event);
}

/**
 * Broadcast when a new list is created
 * @param {string} boardId - The board ID
 * @param {Object} list - The created list object
 */
export function broadcastListCreated(boardId, list) {
  emitBoardEvent(boardId.toString(), {
    type: "list.created",
    list,
  });
}

/**
 * Broadcast when a list is deleted
 * @param {string} boardId - The board ID
 * @param {string} listId - The ID of the deleted list
 */
export function broadcastListDeleted(boardId, listId) {
  emitBoardEvent(boardId.toString(), {
    type: "list.deleted",
    listId,
  });
}

/**
 * Broadcast when a list is updated
 * @param {string} boardId - The board ID
 * @param {Object} list - The updated list object
 */
export function broadcastListUpdated(boardId, list) {
  emitBoardEvent(boardId.toString(), {
    type: "list.updated",
    list,
  });
}

/**
 * Broadcast when a new card is created
 * @param {string} boardId - The board ID
 * @param {Object} card - The created card object
 */
export function broadcastCardCreated(boardId, card) {
  emitBoardEvent(boardId.toString(), {
    type: "card.created",
    card,
  });
}

/**
 * Broadcast when a card is deleted
 * @param {string} boardId - The board ID
 * @param {string} cardId - The ID of the deleted card
 */
export function broadcastCardDeleted(boardId, cardId) {
  emitBoardEvent(boardId.toString(), {
    type: "card.deleted",
    id: cardId,
  });
}

/**
 * Broadcast when a card is updated
 * @param {string} boardId - The board ID
 * @param {string} cardId - The ID of the updated card
 * @param {string} title - The new title
 */
export function broadcastCardUpdated(boardId, cardId, title) {
  emitBoardEvent(boardId.toString(), {
    type: "card.updated",
    id: cardId,
    title,
  });
}

/**
 * Broadcast when list positions are updated (after drag-and-drop)
 * @param {string} boardId - The board ID
 * @param {Array} updates - Array of position updates
 */
export function broadcastListPositions(boardId, updates) {
  emitBoardEvent(boardId.toString(), {
    type: "list.positions",
    updates,
  });
}

/**
 * Broadcast when card positions are updated (after drag-and-drop)
 * @param {string} boardId - The board ID
 * @param {Array} updates - Array of position updates
 */
export function broadcastCardPositions(boardId, updates) {
  emitBoardEvent(boardId.toString(), {
    type: "card.positions",
    updates,
  });
}

/**
 * Broadcast cursor movement for real-time cursor tracking
 * @param {string} boardId - The board ID
 * @param {Object} cursorData - Cursor position and user data
 */
export function broadcastCursorMove(boardId, cursorData) {
  emitBoardEvent(boardId.toString(), {
    type: "cursor.move",
    ...cursorData,
  });
}

/**
 * Broadcast when a user's cursor leaves the board
 * @param {string} boardId - The board ID
 * @param {string} userId - The user ID whose cursor left
 */
export function broadcastCursorLeave(boardId, userId) {
  emitBoardEvent(boardId.toString(), {
    type: "cursor.leave",
    userId,
  });
}

/**
 * Broadcast activity events for activity logging and notifications
 * @param {string} boardId - The board ID
 * @param {string} userId - The user ID who performed the action
 * @param {string} userFullName - The user's full name
 * @param {string} action - The action type (e.g., "card.created", "list.moved")
 * @param {Object} details - Additional details about the action
 */
export function broadcastActivity(boardId, userId, userFullName, action, details = {}) {
  emitBoardEvent(boardId.toString(), {
    type: "activity",
    userId,
    userFullName,
    action,
    details,
  });
}

/**
 * Broadcast when a new comment is created
 * @param {string} boardId - The board ID
 * @param {string} cardId - The card ID where comment was added
 * @param {Object} comment - The created comment object
 */
export function broadcastCommentCreated(boardId, cardId, comment) {
  emitBoardEvent(boardId.toString(), {
    type: "comment.created",
    cardId,
    comment,
  });
}


