"use client";
import { useState, useEffect } from "react";
import { Clock, Users, Activity as ActivityIcon, X } from "lucide-react";
import axios from "axios";

const ActivityLog = ({ boardId, isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && boardId) {
      fetchActivities();
    }
  }, [isOpen, boardId]);

  useEffect(() => {
    if (!boardId) return;
    const es = new EventSource(`/api/boards/${boardId}/sse`);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data || "null");
        if (!data || !data.type) return;
        if (data.type === "activity") {
          setActivities((prev) => [{
            _id: Math.random().toString(36).slice(2),
            action: data.action,
            userFullName: data.userFullName,
            details: data.details || {},
            createdAt: new Date().toISOString(),
          }, ...prev].slice(0, 20));
        }
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [boardId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/boards/${boardId}/activities`);
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

const formatTime = (timestamp) => {
  const date = new Date(timestamp);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  const getActivityMessage = (activity) => {
    const { action, userFullName, details } = activity;
    
    switch (action) {
      case "list.created":
        return `${userFullName} created list "${details.name || 'Untitled'}"`;
      case "list.updated":
        return `${userFullName} renamed list to "${details.name || 'Untitled'}"`;
      case "list.deleted":
        return `${userFullName} deleted a list`;
      case "list.moved":
        return `${userFullName} moved a list`;
      case "card.created":
        return `${userFullName} created card "${details.title || 'Untitled'}"`;
      case "card.updated":
        return `${userFullName} updated card "${details.title || 'Untitled'}"`;
      case "card.deleted":
        return `${userFullName} deleted a card`;
      case "card.moved":
        return `${userFullName} moved a card`;
      case "board.updated":
        return `${userFullName} updated board name`;
      default:
        return `${userFullName} performed an action`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ActivityIcon size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">Activity Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ActivityIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No activities yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {getActivityMessage(activity)}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                                            <span>{formatTime(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={fetchActivities}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
