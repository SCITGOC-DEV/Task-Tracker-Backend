const express = require("express");

const authFromToken = require("./misc/authFromToken");
const verifyAdminRoles = require("./misc/verifyAdminRoles");

const adminLoginRouter = require("./src/adminLogin");
const userLoginRouter = require("./src/userLogin");
const userChangePasswordRouter = require("./src/changePasswordUser");
const adminChangePasswordRouter = require("./src/changePasswordAdmin");
const emailRouter = require("./src/emailSending");
const getImageUploadUrlRouter = require("./src/imageUpload");
const deleteImageRouter = require("./src/deleteImage");
const userRegisterRouter = require("./src/userRegister");
const changeProjectStatusRouter = require("./src/projects/change_project_status");
const changeAssignedProjectStatusRouter = require("./src/projects/change_assigned_project_status");
const changeProjectOwnerRouter = require("./src/projects/change_project_owner");
const getProjectByUserRouter = require("./src/projects/get_project_by_user");
const assignedInventoryToProjectRouter = require("./src/projects/assigned_inventory_to_project");
const assignedInventoryToTaskRouter = require("./src/tasks/assigned_inventory_to_task");
const getProjectDetailsRouter = require("./src/projects/get_project_details");
const createTransactionRouter = require("./src/triggers/trigger_create_transactions");
const createInventoryRouter = require("./src/inventories/create_inventory");
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
app.use("/project/changeProjectStatus", changeProjectStatusRouter);
app.use("/project/changeAssignedProjectStatus", changeAssignedProjectStatusRouter);
app.use("/project/changeProjectOwner", changeProjectOwnerRouter);
app.use("/project/getProjectByUser", getProjectByUserRouter);
app.use("/project/assignedInventoryToProject", assignedInventoryToProjectRouter);
app.use("/task/assignedInventoryToTask", assignedInventoryToTaskRouter);
app.use("/project/getProjectDetails", getProjectDetailsRouter);
app.use("/trigger/createTransaction", createTransactionRouter);

app.use("/inventory/createInventory", authFromToken, createInventoryRouter);

app.listen(3000, () => {
  console.log("Server is listening at port 3000");
});
