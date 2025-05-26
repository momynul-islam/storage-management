const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["note", "pdf", "image"], required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isFavorite: { type: Boolean, default: false },
});

module.exports = mongoose.model("File", fileSchema);
