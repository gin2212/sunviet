const Documents = require("../database/entities/Documents");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
const Users = require("../database/entities/authentication/Users");
const nodemailer = require("nodemailer");
const Notifies = require("../database/entities/Notify");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "winterwyvernwendy@gmail.com",
    pass: "impslqjbynjvqnbw",
  },
});

async function createDocument(req, res) {
  try {
    let document = new Documents(req.body);
    document.createdBy = req.userId;

    if (req?.file) {
      document.file = `files/${req.userId}/${req.file.filename}`;
    }

    let users;

    if (req?.body?.department) {
      users = await Users.find({ department: req.body.department });

      users.forEach(async (user) => {
        const notify = new Notifies({
          createdAt: Date.now(),
          message: `Có 1 tài liệu mới`,
          type: 1,
          recipient: user._id,
          proposal: req.body.department,
        });

        notify.save();

        const mailOptions = {
          from: "winterwyvernwendy@gmail.com",
          to: user.email,
          subject: `Có 1 tài liệu mới`,
          text: "Có 1 tài liệu mới",
        };

        await transporter.sendMail(mailOptions);
      });
    } else {
      document.department = "60d5ecb44b492bd6a3a2621a";
      users = await Users.find();

      users.forEach(async (user) => {
        const notify = new Notifies({
          createdAt: Date.now(),
          message: `Có 1 tài liệu mới`,
          type: 1,
          recipient: user._id,
          proposal: "60d5ecb44b492bd6a3a2621a",
        });

        notify.save();

        const mailOptions = {
          from: "winterwyvernwendy@gmail.com",
          to: user.email,
          subject: `Có 1 tài liệu mới`,
          text: "Có 1 tài liệu mới",
        };

        await transporter.sendMail(mailOptions);
      });
    }

    await document.save();

    const response = new ResponseModel(1, "Create document success!", document);
    res.json(response);
  } catch (error) {
    const response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getAllDocuments(req, res) {
  try {
    const documents = await Documents.find({}).populate(
      "department createdBy updatedBy",
      "departmentName username"
    );
    res.json(documents);
  } catch (error) {
    const response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getDocumentById(req, res) {
  try {
    const document = await Documents.findById(req.params.id).populate(
      "department createdBy updatedBy",
      "departmentName username"
    );
    res.json(document);
  } catch (error) {
    res.status(404).json(404, error.message, error);
  }
}

async function updateDocument(req, res) {
  try {
    let newDocument = {
      updatedTime: Date.now(),
      updatedBy: req.userId,
      ...req.body,
    };

    if (req?.file) {
      newDocument.file = `files/${req.userId}/${req.file.filename}`;
    }

    const updatedDocument = await Documents.findOneAndUpdate(
      { _id: req.params.id },
      newDocument
    );

    if (!updatedDocument) {
      const response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      const response = new ResponseModel(
        1,
        "Update document success!",
        updatedDocument
      );
      res.json(response);
    }
  } catch (error) {
    const response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function deleteDocument(req, res) {
  try {
    const document = await Documents.findByIdAndDelete(req.params.id);

    if (!document) {
      const response = new ResponseModel(0, "No item found!", null);
      res.json(response);
    } else {
      const response = new ResponseModel(1, "Delete document success!", null);
      res.json(response);
    }
  } catch (error) {
    const response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

async function getPagingDocuments(req, res) {
  try {
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    const searchObj = {};
    if (req.query.search) {
      searchObj.title = { $regex: `.*${req.query.search}.*`, $options: "s" };
    }

    const departmentFilter = req.query.department
      ? { $in: [req.query.department, "60d5ecb44b492bd6a3a2621a"] }
      : undefined;

    if (departmentFilter) {
      searchObj.department = departmentFilter;
    }

    const documents = await Documents.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdTime: "desc" })
      .populate("department createdBy updatedBy", "departmentName username");

    const count = await Documents.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / pageSize);

    const pagedModel = new PagedModel(
      pageIndex,
      pageSize,
      totalPages,
      documents
    );
    res.json(pagedModel);
  } catch (error) {
    const response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getPagingDocuments,
};
