const express = require("express");
const proposalController = require("../controllers/proposalController");
const approvalProcessController = require("../controllers/approvalProcessController");
const router = express.Router();
const middlewares = require("./middlewares");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (fs.existsSync(`public/files/${req.body.userId}`)) {
      cb(null, `public/files/${req.body.userId}`);
    } else {
      fs.mkdir(`public/files/${req.body.userId}`, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log("Directory created successfully!");
        cb(null, `public/files/${req.body.userId}`);
      });
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: storage,
});

let uploadFile = upload.single("file");

router.post(
  "/create",
  middlewares.authorize,
  uploadFile,
  proposalController.createProposal
);
router.get(
  "/getAll",
  middlewares.authorize,
  proposalController.getAllProposals
);
router.get(
  "/getById/:id",
  middlewares.authorize,
  proposalController.getProposalById
);
router.put(
  "/update/:id",
  middlewares.authorize,
  uploadFile,
  proposalController.updateProposal
);
router.delete(
  "/delete/:id",
  middlewares.authorize,
  proposalController.deleteProposal
);
router.get(
  "/getPaging",
  middlewares.authorize,
  proposalController.getPagingProposals
);

// Endpoints cho việc duyệt, từ chối và thêm bình luận
router.post(
  "/approve/:proposalId",
  middlewares.authorize,
  proposalController.approveStep
);
router.post(
  "/reject/:proposalId",
  middlewares.authorize,
  proposalController.rejectStep
);
router.post(
  "/comment/:proposalId",
  middlewares.authorize,
  proposalController.addComment
);

module.exports = router;
