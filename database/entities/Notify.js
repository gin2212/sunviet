require("../database");
const mongoose = require("mongoose");

const { Schema } = mongoose;

let Notifieschema = new Schema({
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: 0,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proposal",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notifies", Notifieschema);
