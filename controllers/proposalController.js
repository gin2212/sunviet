const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Proposal = require("../database/entities/Proposal");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createProposal(req, res) {
  try {
    let proposal = new Proposal(req.body);
    proposal.createdBy = req.userId;

    if (req?.file) {
      proposal.file = `public/files/${req.userId}/${req.file.filename}`;
    }

    await proposal.save();

    let response = new ResponseModel(1, "Create proposal success!", proposal);

    res.json(response);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
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
  if (isValidObjectId(req.params.id)) {
    try {
      let proposal = await Proposal.findById(req.params.id);
      res.json(proposal);
    } catch (error) {
      res.status(404).json(404, error.message, error);
    }
  } else {
    res
      .status(404)
      .json(new ResponseModel(404, "ProposalId is not valid!", null));
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
    const proposal = await Proposals.findByIdAndDelete(req.params.id);

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
      searchObj = {
        title: { $regex: ".*" + req.query.search + ".*", $options: "i" },
      };
    }

    let proposals = await Proposals.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdTime: "desc",
      });

    let count = await Proposals.find(searchObj).countDocuments();
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

    // Xác định stepIndex dựa trên userId
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

    // TODO: Xử lý duyệt bước duyệt và lưu vào cơ sở dữ liệu
    const currentStep = steps[stepIndex];
    currentStep.approvers.find(
      (approver) => approver.user.toString() === userId
    ).status = "Approved";
    currentStep.comments.push({ user: userId, content: comment });

    // Kiểm tra xem có đủ approvers đã approved hay chưa
    const allApproved = currentStep.approvers.every(
      (approver) => approver.status === "Approved"
    );

    // Nếu tất cả approvers đã approved, chuyển sang bước tiếp theo
    if (allApproved) {
      if (stepIndex < steps.length - 1) {
        steps[stepIndex + 1].approvers.forEach(
          (approver) => (approver.status = "Pending")
        );
      }

      // Cập nhật trạng thái của đề xuất
      proposal.status = "Pending";

      // TODO: Lưu vào cơ sở dữ liệu
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

    // TODO: Xử lý từ chối bước duyệt và lưu vào cơ sở dữ liệu
    const currentStep = steps[stepIndex];
    currentStep.approvers.find(
      (approver) => approver.user.toString() === userId
    ).status = "Rejected";
    currentStep.comments.push({ user: userId, content: comment });

    // Cập nhật trạng thái của đề xuất
    proposal.status = "Rejected";

    // TODO: Lưu vào cơ sở dữ liệu
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

    // Xác định stepIndex dựa trên userId
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

    // TODO: Thêm bình luận vào bước duyệt và lưu vào cơ sở dữ liệu
    const currentStep = steps[stepIndex];
    currentStep.comments.push({ user: userId, content: commentContent });

    // TODO: Lưu vào cơ sở dữ liệu
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
