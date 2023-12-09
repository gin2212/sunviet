const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Proposals = require("../database/entities/Proposal");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/upload/files");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Tạo đề xuất mới với file upload
async function createProposal(req, res) {
  try {
    const { title, project, selectedApprovalProcess } = req.body;

    // Kiểm tra nếu có file upload
    if (req.file) {
      const file = req.file;
      // Lưu thông tin file vào đối tượng đề xuất
      const fileInfo = {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
      };

      // Thêm thông tin file vào đề xuất
      const proposal = new Proposals({
        title,
        project,
        selectedApprovalProcess,
        file: fileInfo,
      });

      // Lưu đề xuất vào cơ sở dữ liệu
      await proposal.save();

      let response = new ResponseModel(
        1,
        "Create proposal with file success!",
        proposal
      );
      res.json(response);
    } else {
      // Nếu không có file upload
      let proposal = new Proposals({
        title,
        project,
        selectedApprovalProcess,
      });

      // Lưu đề xuất vào cơ sở dữ liệu
      await proposal.save();

      let response = new ResponseModel(1, "Create proposal success!", proposal);
      res.json(response);
    }
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy tất cả đề xuất
async function getAllProposals(req, res) {
  try {
    let proposals = await Proposals.find({});
    res.json(proposals);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

// Lấy thông tin của một đề xuất
async function getProposalById(req, res) {
  if (isValidObjectId(req.params.id)) {
    try {
      let proposal = await Proposals.findById(req.params.id);
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

// Cập nhật đề xuất
async function updateProposal(req, res) {
  try {
    const { title, project, selectedApprovalProcess } = req.body;

    let updatedProposal = await Proposals.findOneAndUpdate(
      { _id: req.params.id },
      { title, project, selectedApprovalProcess },
      { new: true }
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

// Xóa đề xuất
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

// Lấy danh sách đề xuất theo trang
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

module.exports = {
  createProposal,
  getAllProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  getPagingProposals,
};