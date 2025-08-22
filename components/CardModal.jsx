"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const priorities = ["low", "medium", "high"];


const CardModal = ({setLocalCard, card, onClose, onSave, boardId }) => {
  // Form state for card details
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "");
  const [priority, setPriority] = useState(card.priority || "medium");
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    // Fetch existing comments for this card
    axios.get(`/api/cards/${card._id}/comments`).then((res) => {
      if (res.data.success) setComments(res.data.comments || []);
    }).catch(() => {});

    if (!boardId) return;
    
    // Set up SSE connection for real-time comment updates
    const es = new EventSource(`/api/boards/${boardId}/sse`);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data || "null");
        if (!data || !data.type) return;
        
        // Handle new comment creation
        if (data.type === "comment.created" && data.cardId === card._id) {
          // Check if comment already exists to prevent duplicates
          setComments((prev) => {
            const exists = prev.some(c => c._id === data.comment._id);
            if (exists) return prev;
            return [data.comment, ...prev];
          });
        }
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [card._id, boardId]);

  const addComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    setComments((prev) => [
      { _id: Math.random().toString(36).slice(2), text, authorFullName: "Trello Clone", createdAt: new Date().toISOString() },
      ...prev
    ]);
    try {
      const res = await axios.post(`/api/cards/${card._id}/comments`, { text });
      if (res.data.success) {
        // Don't manually add to state - let SSE handle it
        setCommentText("");
      }
    } catch {}
  };

  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    const prevCard = {...card};
    setLocalCard({...card, 
      title : title,
      description : description,
      dueDate : dueDate ? new Date(dueDate).toISOString() : null,
      priority : priority
    });
    onClose();
    try {
      const payload = {
        id: card._id,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
      };
      const res = await axios.patch(`/api/cards`, payload);
      if (res?.data?.success) {
        onSave(res.data.card);
        router.refresh();
      }
    } catch (e) {
      setLocalCard(prevCard);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-4 md:p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Card</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Card Details */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />

            <label className="block text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[120px]" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded px-3 py-2">
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column - Comments */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Comments</label>
            <div className="border rounded p-2 max-h-80 overflow-auto space-y-2">
              {comments.length === 0 ? (
                <div className="text-sm text-gray-500">No comments yet</div>
              ) : comments.map((c) => (
                <div key={c._id} className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">{c.authorFullName} • {new Date(c.createdAt).toLocaleString()}</div>
                  <div className="text-sm">{c.text}</div>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <div className="flex gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 border rounded px-3 py-2" />
              <button onClick={addComment} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add</button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
