const ApprovalProcess = require("../database/entities/your-path-to-approval-process");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

// Tạo Quy trình duyệt mới
async function createApprovalProcess(req, res) {
  try {
    const { processName, steps } = req.body;

    const approvalProcess = new ApprovalProcess({
      processName,
      steps,
    });

    await approvalProcess.save();

    let response = new ResponseModel(
      1,
      "Create approval process success!",
      approvalProcess
    );
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Tạo Bước duyệt mới cho Quy trình duyệt
async function createApprovalStep(req, res) {
  try {
    const { stepName } = req.body;
    const { processId } = req.params;

    const approvalStep = {
      stepName,
    };

    const approvalProcess = await ApprovalProcess.findById(processId);
    if (!approvalProcess) {
      let response = new ResponseModel(0, "Approval process not found!", null);
      return res.json(response);
    }

    approvalProcess.steps.push(approvalStep);

    await approvalProcess.save();

    let response = new ResponseModel(
      1,
      "Create approval step success!",
      approvalStep
    );
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy tất cả Quy trình duyệt
async function getAllApprovalProcesses(req, res) {
  try {
    let approvalProcesses = await ApprovalProcess.find({});
    res.json(approvalProcesses);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy thông tin của một Quy trình duyệt
async function getApprovalProcessById(req, res) {
  try {
    let approvalProcess = await ApprovalProcess.findById(req.params.id);
    res.json(approvalProcess);
  } catch (error) {
    res.status(404).json(404, error.message, error);
  }
}

// Cập nhật Quy trình duyệt
async function updateApprovalProcess(req, res) {
  try {
    const { processName, steps } = req.body;

    let updatedApprovalProcess = await ApprovalProcess.findOneAndUpdate(
      { _id: req.params.id },
      { processName, steps },
      { new: true }
    );

    if (!updatedApprovalProcess) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(
        1,
        "Update approval process success!",
        updatedApprovalProcess
      );
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Xóa Quy trình duyệt
async function deleteApprovalProcess(req, res) {
  try {
    const approvalProcess = await ApprovalProcess.findByIdAndDelete(
      req.params.id
    );

    if (!approvalProcess) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(
        1,
        "Delete approval process success!",
        null
      );
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy tất cả Bước duyệt của Quy trình duyệt
async function getApprovalProcessSteps(req, res) {
  const { processId } = req.params;

  try {
    const approvalProcess = await ApprovalProcess.findById(processId);
    if (!approvalProcess) {
      let response = new ResponseModel(0, "Approval process not found!", null);
      return res.json(response);
    }

    res.json(approvalProcess.steps);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

module.exports = {
  createApprovalProcess,
  createApprovalStep,
  getAllApprovalProcesses,
  getApprovalProcessById,
  updateApprovalProcess,
  deleteApprovalProcess,
  getApprovalProcessSteps,
};
