const { isValidObjectId } = require("mongoose");
const Documents = require("../database/entities/Documents");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");

async function createDocument(req, res) {
  try {
    let document = new Documents(req.body);
    document.createdBy = req.userId;

    if (req?.file) {
      document.file = `files/${req.userId}/${req.file.filename}`;
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
  if (isValidObjectId(req.params.id)) {
    try {
      const document = await Documents.findById(req.params.id).populate(
        "department createdBy updatedBy",
        "departmentName username"
      );
      res.json(document);
    } catch (error) {
      res.status(404).json(404, error.message, error);
    }
  } else {
    res
      .status(404)
      .json(new ResponseModel(404, "DocumentId is not valid!", null));
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
      searchObj.title = { $regex: `.*${req.query.search}.*`, $options: "i" };
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
