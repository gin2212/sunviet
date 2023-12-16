const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const morgan = require("morgan");
var cors = require("cors");
const app = express();
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

app.listen(port, (req, res) => {
  console.log("server listening on port " + port);
});
