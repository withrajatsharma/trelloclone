import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workSpaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkSpace",
      required: true,
      index: true,
    },
    // members: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

BoardSchema.index({ workSpaceId: 1, name: 1 }, { unique: true });
BoardSchema.index({ name: "text" });

export const Board =
  mongoose.models.Board || mongoose.model("Board", BoardSchema);
