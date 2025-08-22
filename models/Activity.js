import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userFullName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "list.created",
        "list.updated", 
        "list.deleted",
        "card.created",
        "card.updated",
        "card.deleted",
        "card.moved",
        "list.moved",
        "board.updated"
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ boardId: 1, createdAt: -1 });

export const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);
