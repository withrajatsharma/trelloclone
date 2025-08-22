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
  },
  {
    timestamps: true,
  }
);
CardSchema.index({ listId: 1, position: 1 });

export const Card = mongoose.models.Card || mongoose.model("Card", CardSchema);