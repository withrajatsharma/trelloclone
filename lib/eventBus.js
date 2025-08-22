class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(boardId, callback) {
    if (!this.listeners.has(boardId)) {
      this.listeners.set(boardId, []);
    }
    
    this.listeners.get(boardId).push(callback);
    
    return () => {
      const boardListeners = this.listeners.get(boardId);
      if (boardListeners) {
        const index = boardListeners.indexOf(callback);
        if (index > -1) {
          boardListeners.splice(index, 1);
        }
        // Clean up empty board listeners
        if (boardListeners.length === 0) {
          this.listeners.delete(boardId);
        }
      }
    };
  }


  emit(boardId, event) {
    const boardListeners = this.listeners.get(boardId);
    if (boardListeners) {
      // Call all listeners for this board
      boardListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

 
  clear(boardId) {
    this.listeners.delete(boardId);
  }

  
  listenerCount(boardId) {
    const boardListeners = this.listeners.get(boardId);
    return boardListeners ? boardListeners.length : 0;
  }


  getActiveBoards() {
    return Array.from(this.listeners.keys());
  }
}

// Create and export a singleton instance
export const eventBus = new EventBus();


