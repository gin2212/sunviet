const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const approverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

const stepSchema = new mongoose.Schema({
  stepName: { type: String, required: true },
  approvers: [approverSchema],
  comments: [commentSchema],
});

const approvalProcessSchema = new mongoose.Schema({
  processName: { type: String, required: true },
  steps: [stepSchema],
});

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  file: { type: String },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Projects",
    required: true,
  },
  selectedApprovalProcess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApprovalProcess",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

const ApprovalProcess = mongoose.model(
  "ApprovalProcess",
  approvalProcessSchema
);
const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = { ApprovalProcess, Proposal };
