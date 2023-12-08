const express = require('express');
const proposalController = require('../controllers/proposalController');
const router = express.Router();
const middlewares = require('./middlewares');
const multer = require('multer');

// Middleware để xử lý upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đường dẫn lưu trữ file
    const uploadPath = path.join(__dirname, '../public/upload/files');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Đặt tên file mới dựa trên thời gian
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/proposals/create', middlewares.authorize, upload.single('file'),proposalController.createProposal);
router.get('/proposals/getAll', middlewares.authorize, proposalController.getAllProposals);
router.get('/proposals/getById/:id', middlewares.authorize, proposalController.getProposalById);
router.put('/proposals/update/:id', middlewares.authorize, upload.single('file'),proposalController.updateProposal);
router.delete('/proposals/delete/:id', middlewares.authorize, proposalController.deleteProposal);
router.get('/proposals/getPaging', middlewares.authorize, proposalController.getPagingProposals);


module.exports = router;