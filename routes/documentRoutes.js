// documentRoutes.js
const express = require("express");
const documentController = require("../controllers/documentController");
const router = express.Router();
const middlewares = require("./middlewares");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (fs.existsSync(`public/files/${req.userId}`)) {
      cb(null, `public/files/${req.userId}`);
    } else {
      fs.mkdir(`public/files/${req.userId}`, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log("Directory created successfully!");
        cb(null, `public/files/${req.userId}`);
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
  "/documents/create",
  middlewares.authorize,
  uploadFile,
  documentController.createDocument
);
router.get(
  "/documents/getAll",
  middlewares.authorize,
  documentController.getAllDocuments
);
router.get(
  "/documents/getById/:id",
  middlewares.authorize,
  documentController.getDocumentById
);
router.put(
  "/documents/update/:id",
  middlewares.authorize,
  uploadFile,
  documentController.updateDocument
);
router.delete(
  "/documents/delete/:id",
  middlewares.authorize,
  documentController.deleteDocument
);
router.get(
  "/documents/getPaging",
  middlewares.authorize,
  documentController.getPagingDocuments
);

module.exports = router;
