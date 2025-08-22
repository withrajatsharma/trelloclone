import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorFullName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
