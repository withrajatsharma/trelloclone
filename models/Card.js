import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Card description cannot exceed 1000 characters"],
    },
    listId: {
      type: Schema.Types.ObjectId,
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

export default mongoose.models.Card ||
  mongoose.model < ICard > ("Card", CardSchema);
