import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
  itemTags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);