require("../database");
const mongoose = require("mongoose");

const approvalStepSchema = new mongoose.Schema({
  stepName: { type: String, required: true },
  approvers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
    },
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const approvalProcessSchema = new mongoose.Schema({
  processName: { type: String, required: true },
  steps: [approvalStepSchema],
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
