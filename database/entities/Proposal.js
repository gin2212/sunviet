require("../database");
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
  approvers: approverSchema,
});

const proposalContentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  agency: { type: Number, required: true, default: 1 },
  mass: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 1 },
  totalCost: { type: Number, required: true, default: 1 },
  descripton: { type: String },
});

const approvalProcessSchema = new mongoose.Schema({
  processName: { type: String, required: true },
  steps: [stepSchema],
});

const clonedApprovalProcessSchema = new mongoose.Schema({
  processName: { type: String, required: true },
  steps: [stepSchema],
});

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  file: { type: String },
  signatureImage: { type: String },
  category: { type: String },
  content: { type: String },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Projects",
    required: true,
  },
  selectedApprovalProcess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClonedApprovalProcess",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  comments: [commentSchema],
  proposalContent: [proposalContentSchema],
});

const ApprovalProcess = mongoose.model(
  "ApprovalProcess",
  approvalProcessSchema
);

const ClonedApprovalProcess = mongoose.model(
  "ClonedApprovalProcess",
  clonedApprovalProcessSchema
);

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = { ApprovalProcess, ClonedApprovalProcess, Proposal };
