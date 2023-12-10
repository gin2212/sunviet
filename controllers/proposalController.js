const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Proposals = require("../database/entities/Proposal");
const PagedModel = require("../models/PagedModel");
const ResponseModel = require("../models/ResponseModel");
async function createProposal(req, res) {
  try {
    let proposal = new Proposals(req.body);
    proposal.createdBy = req.userId;

    if (req?.file) {
      proposal.file = `public/files/${req.file.filename}`;
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
    let proposals = await Proposals.find({});
    res.json(proposals);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(404).json(response);
  }
}

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

async function updateProposal(req, res) {
  try {
    let newProposal = {
      updatedTime: Date.now(),
      updatedBy: req.userId,
      ...req.body,
    };

    if (req?.file) {
      newProposal.file = `public/files/${req.file.filename}`;
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

module.exports = {
  createProposal,
  getAllProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  getPagingProposals,
};
