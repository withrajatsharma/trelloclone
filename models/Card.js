import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: [true, "List ID is required"],
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: { type: String, default: "" },
    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  {
    timestamps: true,
  }
);
CardSchema.index({ listId: 1, position: 1 });

export const Card = mongoose.models.Card || mongoose.model("Card", CardSchema);