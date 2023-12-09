// documentSchema.js
require("../database");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema({
  title: { type: String, required: true },
  file: { type: String },
  content: { type: String },
  department: { type: Schema.Types.ObjectId, ref: "Departments" },
  createdBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  createdTime: { type: Date, default: Date.now },
  updatedTime: { type: Date },
  updatedBy: { type: Schema.Types.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("Documents", documentSchema);
