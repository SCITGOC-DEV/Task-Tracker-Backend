const express = require("express");
const adminLoginRouter = require("./src/adminLogin");
const userLoginRouter = require("./src/userLogin");
const userChangePasswordRouter = require("./src/changePasswordUser");
const adminChangePasswordRouter = require("./src/changePasswordAdmin");
const emailRouter = require("./src/emailSending");
const getImageUploadUrlRouter = require("./src/imageUpload");
const deleteImageRouter = require("./src/deleteImage");
const userRegisterRouter = require("./src/userRegister");
const changeProjectStatus = require("./src/projects/change_project_status");
const changeAssignedProjectStatus = require("./src/projects/change_assigned_project_status");
const changeProjectOwner = require("./src/projects/change_project_owner");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/adminLogin", adminLoginRouter);
app.use("/userLogin", userLoginRouter);
app.use("/userRegister", userRegisterRouter);
app.use("/userChangePassword", userChangePasswordRouter);
app.use("/adminChangePassword", adminChangePasswordRouter);
app.use("/email", emailRouter);
app.use("/getImage", getImageUploadUrlRouter);
app.use("/deleteImage", deleteImageRouter);
app.use("/project/changeProjectStatus", changeProjectStatus);
app.use("/project/change_assigned_project_status", changeAssignedProjectStatus);
app.use("/project/change_project_owner", changeProjectOwner);

app.listen(3000, () => {
  console.log("Server is listening at port 3000");
});
