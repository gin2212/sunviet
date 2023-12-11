const { ApprovalProcess } = require("../database/entities/Proposal");
const ResponseModel = require("../models/ResponseModel");

async function createApprovalProcess(req, res) {
  try {
    const newApprovalProcess = new ApprovalProcess(req.body);

    await newApprovalProcess.save();
    let response = new ResponseModel(
      1,
      "Create approval process success!",
      newApprovalProcess
    );
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllApprovalProcesses(req, res) {
  try {
    const approvalProcesses = await ApprovalProcess.find();
    res.json(approvalProcesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getApprovalProcessById(req, res) {
  try {
    const approvalProcess = await ApprovalProcess.findById(req.params.id);
    if (!approvalProcess) {
      return res.status(404).json({ message: "Approval process not found" });
    }
    res.json(approvalProcess);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateApprovalProcess(req, res) {
  try {
    const { processName, steps } = req.body;
    const updatedApprovalProcess = await ApprovalProcess.findByIdAndUpdate(
      req.params.id,
      { processName, steps },
      { new: true }
    );

    if (!updatedApprovalProcess) {
      return res.status(404).json({ message: "Approval process not found" });
    }

    res.json(updatedApprovalProcess);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteApprovalProcess(req, res) {
  try {
    const deletedApprovalProcess = await ApprovalProcess.findByIdAndDelete(
      req.params.id
    );

    if (!deletedApprovalProcess) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    }
    let response = new ResponseModel(
      1,
      "Delete Approval process  success!",
      null
    );
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPagingApprovalProcesses(req, res) {
  try {
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    const searchObj = {};

    const approvalProcesses = await ApprovalProcess.find(searchObj)
      .populate({
        path: "steps.approvers.user",
        model: "Users",
      })
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdTime: "desc",
      });

    const count = await ApprovalProcess.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / pageSize);

    const pagedModel = {
      pageIndex,
      pageSize,
      totalPages,
      data: approvalProcesses,
    };

    res.json(pagedModel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createApprovalProcess,
  getAllApprovalProcesses,
  getApprovalProcessById,
  updateApprovalProcess,
  deleteApprovalProcess,
  getPagingApprovalProcesses,
};
