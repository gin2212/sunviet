const express = require("express");
const proposalController = require("../controllers/proposalController");
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
  "/proposals/create",
  middlewares.authorize,
  uploadFile,
  proposalController.createProposal
);
router.get(
  "/proposals/getAll",
  middlewares.authorize,
  proposalController.getAllProposals
);
router.get(
  "/proposals/getById/:id",
  middlewares.authorize,
  proposalController.getProposalById
);
router.put(
  "/proposals/update/:id",
  middlewares.authorize,
  uploadFile,
  proposalController.updateProposal
);
router.delete(
  "/proposals/delete/:id",
  middlewares.authorize,
  proposalController.deleteProposal
);
router.get(
  "/proposals/getPaging",
  middlewares.authorize,
  proposalController.getPagingProposals
);

module.exports = router;