import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    minlength: 3, 
    maxlength: 50 
  },
  description: { 
    type: String, 
    required: true, 
    minlength: 3, 
    maxlength: 256 
  },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
  itemTags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Item || mongoose.model("Item", itemSchema);