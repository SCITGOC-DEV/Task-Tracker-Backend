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

const addAssignedProjectRouter = require("./src/projects/add_assigned_project ");
const assignedInventoryToProjectRouter = require("./src/projects/assigned_inventory_to_project");
const changeAssignedProjectStatusRouter = require("./src/projects/change_assigned_project_status");
const changeProjectOwnerRouter = require("./src/projects/change_project_owner");
const changeProjectStatusRouter = require("./src/projects/change_project_status");
const getProjectByUserRouter = require("./src/projects/get_project_by_user");
const getProjectDetailsRouter = require("./src/projects/get_project_details");
const createProjectRouter = require("./src/projects/create_project");
const updateAssignedProjectRouter = require("./src/projects/update_assigned_project");
const updateProjectRouter = require("./src/projects/update_project ");

const assignedInventoryToTaskRouter = require("./src/tasks/assigned_inventory_to_task");
const createAssignedTaskRouter = require("./src/tasks/create_assigned_task");
const createTaskRouter = require("./src/tasks/create_task");
const updateAssignedTaskRouter = require("./src/tasks/update_assigned_task");
const updateTaskRouter = require("./src/tasks/update_task");

const createTransactionRouter = require("./src/triggers/trigger_create_transactions");

const createInventoryRouter = require("./src/inventories/create_inventory");
const createReturnInventoryProjectRouter = require("./src/inventories/create_return_inventory_project ");
const createReturnInventoryTaskRouter = require("./src/inventories/create_return_inventory_task");
const updateInventoryRouter = require("./src/inventories/update_inventory");
const updateReturnInventoryProjectRouter = require("./src/inventories/update_return_inventory_project");
const updateReturnInventoryTaskRouter = require("./src/inventories/update_return_inventory_task");


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

app.use("/project/addAssignedProject", addAssignedProjectRouter);
app.use("/project/assignedInventoryToProject", assignedInventoryToProjectRouter);
app.use("/project/changeAssignedProjectStatus", changeAssignedProjectStatusRouter);
app.use("/project/changeProjectOwner", changeProjectOwnerRouter);
app.use("/project/changeProjectStatus", changeProjectStatusRouter);
app.use("/project/createProject", createProjectRouter);
app.use("/project/getProjectByUser", getProjectByUserRouter);
app.use("/project/getProjectDetails", getProjectDetailsRouter);
app.use("/project/updateAssignedProject", updateAssignedProjectRouter);
app.use("/project/updateProject", updateProjectRouter);

app.use("/task/assignedInventoryToTask", assignedInventoryToTaskRouter);
app.use("/task/createAssignedTask", createAssignedTaskRouter);
app.use("/task/createTask", createTaskRouter);
app.use("/task/updateAssignedTask", updateAssignedTaskRouter);
app.use("/task/updateTask", updateTaskRouter);

app.use("/trigger/createTransaction", createTransactionRouter);

app.use("/inventory/createInventory", authFromToken, createInventoryRouter);
app.use("/inventory/createReturnInventoryProject", authFromToken, createReturnInventoryProjectRouter);
app.use("/inventory/createReturnInventoryTask", authFromToken, createReturnInventoryTaskRouter);
app.use("/inventory/updateInventory", authFromToken, updateInventoryRouter);
app.use("/inventory/updateReturnInventoryProject", authFromToken, updateReturnInventoryProjectRouter);
app.use("/inventory/updateReturnInventoryTask", authFromToken, updateReturnInventoryTaskRouter);

app.listen(3000, () => {
  console.log("Server is listening at port 3000");
});
