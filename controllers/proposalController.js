const { Proposal } = require("../database/entities/Proposal");
const { ApprovalProcess } = require("../database/entities/Proposal");
const { ClonedApprovalProcess } = require("../database/entities/Proposal");
const Notifies = require("../database/entities/Notify");
const Users = require("../database/entities/authentication/Users");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "winterwyvernwendy@gmail.com",
    pass: "impslqjbynjvqnbw",
  },
});

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
        approvers: { user: step.approvers.user, status: "Pending" },
      })),
    });

    await clonedApprovalProcess.save();

    const proposal = new Proposal({
      title: req.body.title,
      file: req?.file ? `files/${req.userId}/${req.file.filename}` : undefined,
      createdBy: req.userId,
      project: req.body.project,
      signatureImage: req.body.signatureImage,
      category: req.body.category,
      selectedApprovalProcess: clonedApprovalProcess._id,
      content: req.body.content,
    });

    await proposal.save();

    let response = new ResponseModel(1, "Create proposal success!", proposal);
    res.json(response);

    const userInfo = await Users.findById(
      originalApprovalProcess.steps[0].approvers.user
    );

    const notify = new Notifies({
      createdAt: Date.now(),
      message: `có 1 đề xuất: ${response.data.title} cần được xử lý`,
      recipient: userInfo._id,
      proposal: response.data._id,
    });

    notify.save();

    const mailOptions = {
      from: "winterwyvernwendy@gmail.com",
      to: userInfo.email,
      subject: `có 1 đề xuất: ${response.data.title} cần được xử lý`,
      text: "Có 1 đề xuất cần được xử lý",
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    let response = new ResponseModel(500, error.message, error);
    res.status(500).json(response);
  }
}

async function getAllProposals(req, res) {
  try {
    let proposals = await Proposal.find({})
      .sort({
        createdTime: "desc",
      })
      .populate("createdBy")
      .populate("project")
      .populate({
        path: "selectedApprovalProcess",
        populate: {
          path: "steps.approvers.user",
          model: "Users",
        },
      });
    res.json(proposals);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getProposalById(req, res) {
  try {
    let proposal = await Proposal.findById(req.params.id)
      .populate("createdBy")
      .populate("project")
      .populate({
        path: "selectedApprovalProcess",
        populate: {
          path: "steps.approvers.user",
          model: "Users",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "Users",
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
      newProposal.file = `files/${req.userId}/${req.file.filename}`;
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
    if (req.query.type == 2) {
      searchObj["selectedApprovalProcess.steps.approvers.user"] = req.userId;
      searchObj["selectedApprovalProcess.steps.approvers.status"] = "Approved";
    }

    if (req.query.type == 3) {
      searchObj["selectedApprovalProcess.steps.approvers.user"] = req.userId;
      searchObj["selectedApprovalProcess.steps.approvers.status"] = "Rejected";
    }

    if (req.query.type == 4) {
      searchObj["selectedApprovalProcess.steps.approvers.user"] = req.userId;
      searchObj["selectedApprovalProcess.steps.approvers.status"] = "Pending";
    }

    let proposals = [];

    if (req.query.type == 1) {
      const proposalsAtCurrentStep = await Proposal.find({
        createdBy: req.userId,
      })
        .sort({
          createdTime: "desc",
        })
        .populate("createdBy")
        .populate("project")
        .populate({
          path: "selectedApprovalProcess",
          populate: {
            path: "steps.approvers.user",
            model: "Users",
          },
        });

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
        .populate("createdBy")
        .populate("project")
        .populate({
          path: "selectedApprovalProcess",
          populate: {
            path: "steps.approvers.user",
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
    const userId = req.userId;

    const proposal = await Proposal.findById(proposalId)
      .populate("createdBy")
      .populate("project")
      .populate({
        path: "selectedApprovalProcess",
        populate: {
          path: "steps.approvers.user",
          model: "Users",
        },
      });

    const { selectedApprovalProcess } = proposal;
    const { steps } = selectedApprovalProcess;

    const stepIndex = steps.findIndex(
      (step) =>
        step.approvers.user._id.toString() === userId &&
        step.approvers.status === "Pending"
    );

    if (stepIndex === -1) {
      return res
        .status(400)
        .json({ message: "User không có quyền duyệt bước này." });
    }

    if (stepIndex >= steps.length - 1) {
      proposal.status = "Approved";
      await proposal.save();
    }

    let clonedApprovalProcess = await ClonedApprovalProcess.findById(
      proposal.selectedApprovalProcess._id
    );
    clonedApprovalProcess.steps[stepIndex].approvers.status = "Approved";
    clonedApprovalProcess.save();

    let response = new ResponseModel(1, "Bước duyệt đã được duyệt.", {
      proposal,
    });

    res.json(response);

    const notify = new Notifies({
      createdAt: Date.now(),
      message: `quy trình ${steps[stepIndex].stepName} của đề xuất ${proposal.title} đã được duyệt `,
      recipient: proposal.createdBy._id,
      proposal: proposal._id,
    });

    notify.save();

    const mailOptions = {
      from: "winterwyvernwendy@gmail.com",
      to: proposal.createdBy.email,
      subject: `quy trình ${steps[stepIndex].stepName} của đề xuất ${proposal.title} đã được duyệt `,
      text: "Chúc mừng, bước duyệt đã được duyệt!",
    };
    // Gửi email
    await transporter.sendMail(mailOptions);

    if (stepIndex < steps.length - 1) {
      const notify1 = new Notifies({
        createdAt: Date.now(),
        message: `có 1 đề xuất: ${proposal.title} cần được xử lý`,
        recipient: steps[stepIndex + 1].approvers.user._id,
        proposal: proposal._id,
      });
      notify1.save();
      const mailOptions1 = {
        from: "winterwyvernwendy@gmail.com",
        to: steps[stepIndex + 1].approvers.user.email,
        subject: `có 1 đề xuất: ${proposal.title} cần được xử lý`,
        text: "Có 1 đề xuất cần được xử lý",
      };
      await transporter.sendMail(mailOptions1);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function rejectStep(req, res) {
  try {
    const { proposalId } = req.params;
    const userId = req.userId;

    const proposal = await Proposal.findById(proposalId)
      .populate("createdBy")
      .populate("project")
      .populate({
        path: "selectedApprovalProcess",
        populate: {
          path: "steps.approvers.user",
          model: "Users",
        },
      });

    // Xác định stepIndex dựa trên userId
    const { selectedApprovalProcess } = proposal;
    const { steps } = selectedApprovalProcess;
    const stepIndex = steps.findIndex(
      (step) =>
        step.approvers.user._id.toString() === userId &&
        step.approvers.status === "Pending"
    );

    if (stepIndex === -1) {
      return res
        .status(400)
        .json({ message: "User không có quyền từ chối bước này." });
    }

    let clonedApprovalProcess = await ClonedApprovalProcess.findById(
      proposal.selectedApprovalProcess._id
    );

    clonedApprovalProcess.steps[stepIndex].approvers.status = "Rejected";
    clonedApprovalProcess.save();
    proposal.status = "Rejected";

    await proposal.save();

    let response = new ResponseModel(1, "Bước duyệt đã bị từ chối.", {
      proposal,
    });

    res.json(response);

    const notify = new Notifies({
      createdAt: Date.now(),
      message: `quy trình ${steps[stepIndex].stepName} của đề xuất ${proposal.title} đã bị từ chối `,
      recipient: proposal.createdBy._id,
      proposal: proposal._id,
    });

    notify.save();

    const mailOptions = {
      from: "winterwyvernwendy@gmail.com",
      to: proposal.createdBy.email,
      subject: `Quy trình ${steps[stepIndex].stepName} của đề xuất ${proposal.title} đã bị từ chối `,
      text: `Đề xuất ${proposal.title} đã bị từ chối !`,
    };
    // Gửi email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addComment(req, res) {
  try {
    const { proposalId } = req.params;
    const { commentContent } = req.body;
    const userId = req.userId;

    const proposal = await Proposal.findById(proposalId)
      .populate("createdBy")
      .populate("project")
      .populate({
        path: "selectedApprovalProcess",
        populate: {
          path: "steps.approvers.user",
          model: "Users",
        },
      });

    const { selectedApprovalProcess } = proposal;
    const { steps } = selectedApprovalProcess;

    const stepIndex = steps.findIndex(
      (step) =>
        step.approvers.user._id.toString() === userId &&
        step.approvers.status === "Pending"
    );

    if (stepIndex === -1) {
      return res
        .status(400)
        .json({ message: "User không có quyền thêm bình luận cho bước này." });
    }

    proposal.comments.push({
      user: userId,
      content: commentContent,
    });

    await proposal.save();

    let response = new ResponseModel(1, "Bình luận thành công!", {
      proposal,
    });

    res.json(response);

    const notify = new Notifies({
      createdAt: Date.now(),
      message: `quy trình ${steps[stepIndex].stepName} của đề xuất ${proposal.title} có 1 bình luận mới `,
      recipient: proposal.createdBy._id,
      proposal: proposal._id,
    });

    notify.save();

    const mailOptions = {
      from: "winterwyvernwendy@gmail.com",
      to: proposal.createdBy.email,
      subject: `Quy trình ${steps[stepIndex].stepName} của đề xuất ${proposal.title} có 1 bình luận mới  `,
      text: `Quy trình ${proposal.title} có 1 bình luận mới !`,
    };
    // Gửi email
    await transporter.sendMail(mailOptions);
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
