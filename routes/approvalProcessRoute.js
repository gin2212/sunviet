const express = require("express");
const approvalProcessController = require("../controllers/approvalProcessController");
const router = express.Router();
const middlewares = require("./middlewares");

router.post(
  "/create",
  middlewares.authorize,
  approvalProcessController.createApprovalProcess
);

router.get(
  "/getAll",
  middlewares.authorize,
  approvalProcessController.getAllApprovalProcesses
);

router.get(
  "/getPaging",
  middlewares.authorize,
  approvalProcessController.getPagingApprovalProcesses
);

router.get(
  "/getById/:id",
  middlewares.authorize,
  approvalProcessController.getApprovalProcessById
);

router.put(
  "/update/:id",
  middlewares.authorize,
  approvalProcessController.updateApprovalProcess
);

router.delete(
  "/delete/:id",
  middlewares.authorize,
  approvalProcessController.deleteApprovalProcess
);

module.exports = router;
