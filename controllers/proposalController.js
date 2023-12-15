const { Proposal } = require("../database/entities/Proposal");
const { ApprovalProcess } = require("../database/entities/Proposal");
const { ClonedApprovalProcess } = require("../database/entities/Proposal");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createProposal(req, res) {
  try {
    const approvalProcessId = req.body.approvalProcessId;

    const originalApprovalProcess = await ApprovalProcess.findById(
      approvalProcessId
    );

    if (!originalApprovalProcess) {
      let response = new ResponseModel(404, "ApprovalProcess not found!", null);
      return res.status(404).json(response);
    }

    const clonedApprovalProcess = new ClonedApprovalProcess({
      processName: originalApprovalProcess.processName,
      steps: originalApprovalProcess.steps.map((step) => ({
        stepName: step.stepName,
        approvers: step.approvers.map((approver) => ({
          user: approver.user,
          status: "Pending",
        })),
        comments: [],
      })),
    });

    await clonedApprovalProcess.save();

    const proposal = new Proposal({
      title: req.body.title,
      file: req?.file
        ? `public/files/${req.userId}/${req.file.filename}`
        : undefined,
      createdBy: req.userId,
      project: req.body.project,
      signatureImage: req.body.signatureImage,
      category: req.body.category,
      selectedApprovalProcess: clonedApprovalProcess._id,
    });

    await proposal.save();

    let response = new ResponseModel(1, "Create proposal success!", proposal);
    res.json(response);
  } catch (error) {
    let response = new ResponseModel(500, error.message, error);
    res.status(500).json(response);
  }
}

async function getAllProposals(req, res) {
  try {
    let proposals = await Proposal.find({});
    res.json(proposals);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getProposalById(req, res) {
  try {
    let proposal = await Proposal.findById(req.params.id)
      .populate("createdBy") // Populate thông tin người tạo đề xuất
      .populate("project") // Populate thông tin dự án
      .populate({
        path: "selectedApprovalProcess",
        populate: {
          path: "steps.approvers.user steps.comments.user",
          model: "Users", // Populate thông tin người duyệt và người bình luận
        },
      });

    res.json(proposal);
  } catch (error) {
    res.status(404).json(new ResponseModel(404, error.message, error));
  }
}

async function updateProposal(req, res) {
  try {
    let newProposal = {
      updatedTime: Date.now(),
      updatedBy: req.userId,
      ...req.body,
    };

    if (req?.file) {
      newProposal.file = `public/files/${req.userId}/${req.file.filename}`;
    }

    let updatedProposal = await Departments.findOneAndUpdate(
      { _id: req.params.id },
      newProposal
    );

    if (!updatedProposal) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(
        1,
        "Update proposal success!",
        updatedProposal
      );
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function deleteProposal(req, res) {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);

    if (!proposal) {
      let response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      let response = new ResponseModel(1, "Delete proposal success!", null);
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getPagingProposals(req, res) {
  try {
    let pageSize = req.query.pageSize || 10;
    let pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.search) {
      searchObj.title = {
        $regex: ".*" + req.query.search + ".*",
        $options: "i",
      };
    }

    // Bổ sung các bộ lọc mới
    if (req.query.myProposals) {
      searchObj.createdBy = req.userId;
    }

    if (req.query.type === 1) {
      searchObj["selectedApprovalProcess.steps.approvers.user"] = req.userId;
      searchObj["selectedApprovalProcess.steps.approvers.status"] = "Approved";
    }

    if (req.query.type === 2) {
      searchObj["selectedApprovalProcess.steps.approvers.user"] = req.userId;
      searchObj["selectedApprovalProcess.steps.approvers.status"] = "Rejected";
    }

    if (req.query.type === 3) {
      // Lọc đề xuất ở bước duyệt của người dùng hiện tại
      searchObj["selectedApprovalProcess.steps.approvers.user"] = req.userId;
      searchObj["selectedApprovalProcess.steps.approvers.status"] = "Pending";
    }

    let proposals = [];

    if (req.query.type === 3) {
      // Lấy danh sách các đề xuất ở bước duyệt của người dùng hiện tại
      const proposalsAtCurrentStep = await Proposal.find({
        "selectedApprovalProcess.steps.approvers.user": req.userId,
        "selectedApprovalProcess.steps.approvers.status": "Pending",
      })
        .populate("createdBy project selectedApprovalProcess")
        .populate({
          path: "selectedApprovalProcess.steps",
          populate: {
            path: "approvers.user comments.user",
            model: "Users",
          },
        });

      // Lọc theo các điều kiện khác nếu cần
      proposals = proposalsAtCurrentStep.filter((proposal) =>
        Object.keys(searchObj).every((key) => proposal[key] === searchObj[key])
      );
    } else {
      proposals = await Proposal.find(searchObj)
        .skip(pageSize * pageIndex - pageSize)
        .limit(parseInt(pageSize))
        .sort({
          createdTime: "desc",
        })
        .populate("createdBy project selectedApprovalProcess")
        .populate({
          path: "selectedApprovalProcess.steps",
          populate: {
            path: "approvers.user comments.user",
            model: "Users",
          },
        });
    }

    let count = await Proposal.find(searchObj).countDocuments();
    let totalPages = Math.ceil(count / pageSize);
    let pagedModel = new PagedModel(pageIndex, pageSize, totalPages, proposals);
    res.json(pagedModel);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function approveStep(req, res) {
  try {
    const { proposalId } = req.params;
    const { userId, comment } = req.body;

    const proposal = await Proposal.findById(proposalId).populate(
      "selectedApprovalProcess"
    );

    const { selectedApprovalProcess } = proposal;
    const { steps } = selectedApprovalProcess;

    const stepIndex = steps.findIndex((step) =>
      step.approvers.some((approver) => approver.user.toString() === userId)
    );

    if (stepIndex === -1) {
      return res
        .status(400)
        .json({ message: "User không có quyền duyệt bước này." });
    }

    const currentStep = steps[stepIndex];
    currentStep.approvers.find(
      (approver) => approver.user.toString() === userId
    ).status = "Approved";
    currentStep.comments.push({ user: userId, content: comment });

    const allApproved = currentStep.approvers.every(
      (approver) => approver.status === "Approved"
    );

    if (allApproved) {
      if (stepIndex < steps.length - 1) {
        steps[stepIndex + 1].approvers.forEach(
          (approver) => (approver.status = "Pending")
        );
      }

      proposal.status = "Pending";

      await proposal.save();
    }

    res.status(200).json({ message: "Bước duyệt đã được duyệt." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function rejectStep(req, res) {
  try {
    const { proposalId } = req.params;
    const { userId, comment } = req.body;

    const proposal = await Proposal.findById(proposalId).populate(
      "selectedApprovalProcess"
    );

    // Xác định stepIndex dựa trên userId
    const { selectedApprovalProcess } = proposal;
    const { steps } = selectedApprovalProcess;

    const stepIndex = steps.findIndex((step) =>
      step.approvers.some((approver) => approver.user.toString() === userId)
    );

    if (stepIndex === -1) {
      return res
        .status(400)
        .json({ message: "User không có quyền từ chối bước này." });
    }

    const currentStep = steps[stepIndex];
    currentStep.approvers.find(
      (approver) => approver.user.toString() === userId
    ).status = "Rejected";
    currentStep.comments.push({ user: userId, content: comment });

    proposal.status = "Rejected";

    await proposal.save();

    res.status(200).json({ message: "Bước duyệt đã bị từ chối." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addComment(req, res) {
  try {
    const { proposalId } = req.params;
    const { userId, commentContent } = req.body;

    const proposal = await Proposal.findById(proposalId).populate(
      "selectedApprovalProcess"
    );

    const { selectedApprovalProcess } = proposal;
    const { steps } = selectedApprovalProcess;

    const stepIndex = steps.findIndex((step) =>
      step.approvers.some((approver) => approver.user.toString() === userId)
    );

    if (stepIndex === -1) {
      return res
        .status(400)
        .json({ message: "User không có quyền thêm bình luận cho bước này." });
    }

    const currentStep = steps[stepIndex];
    currentStep.comments.push({ user: userId, content: commentContent });

    await proposal.save();

    res.status(200).json({ message: "Bình luận đã được thêm vào bước duyệt." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createProposal,
  getAllProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  getPagingProposals,
  addComment,
  rejectStep,
  approveStep,
};
