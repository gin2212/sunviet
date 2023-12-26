const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const morgan = require("morgan");
var cors = require("cors");
const app = express();
const fs = require("fs");
// Sử dụng multer để xử lý file được gửi từ client
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(morgan("combined"));
app.use(
  cors({
    origin: "*",
  })
);
app.use("/", express.static(path.join(__dirname, "public/")));
const port = process.env.PORT;

const userRoute = require("./routes/userRoute");
const notifyRoute = require("./routes/notifyRoute");
const roleRoute = require("./routes/roleRoute");
const actionRoute = require("./routes/actionRoute");
const approvalProcessRoute = require("./routes/approvalProcessRoute");
const departmentRoute = require("./routes/departmentRoute");
const projectRoute = require("./routes/projectRoute");
const proposalRoute = require("./routes/proposalRoute");
const documentlRoute = require("./routes/documentRoutes");
const roleActionRoute = require("./routes/roleActionRoute");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//import routes
app.use("/api/user", userRoute);
app.use("/api/role", roleRoute);
app.use("/api/action", actionRoute);
app.use("/api/approval-process", approvalProcessRoute);
app.use("/api/department", departmentRoute);
app.use("/api/project", projectRoute);
app.use("/api/proposal", proposalRoute);
app.use("/api/document", documentlRoute);
app.use("/api/roleaction", roleActionRoute);
app.use("/api/notify", notifyRoute);

app.put("/api/update-pdf", upload.single("pdf"), async (req, res) => {
  try {
    // Lấy thông tin từ body của request
    const { fileLink } = req.body;

    // Kiểm tra xem fileLink và file đã được gửi từ client chưa
    if (!fileLink || !req.file) {
      return res
        .status(400)
        .json({ message: "Invalid request. Missing fileLink or pdf." });
    }

    // Lấy dữ liệu PDF từ req.file
    const pdfBuffer = req.file.buffer;

    // Nối đường dẫn từ thư mục gốc và fileLink
    const filePath = path.join(__dirname, "public/", fileLink);

    // Ghi dữ liệu mới vào file
    fs.writeFileSync(filePath, pdfBuffer);

    // Trả về thông báo thành công
    res.status(200).json({ message: "File updated successfully." });
  } catch (error) {
    console.error("Failed to update file:", error);
    res.status(500).json({ message: "Failed to update file." });
  }
});

app.listen(port, (req, res) => {
  console.log("server listening on port " + port);
});
