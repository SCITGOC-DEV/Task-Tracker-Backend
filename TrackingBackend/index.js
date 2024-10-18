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
const changeUserForAssignedTaskRouter = require("./src/tasks/change_user_for_assigned_task");
const createAssignedTaskRouter = require("./src/tasks/create_assigned_task");
const removeAssignedTaskRouter = require("./src/tasks/remove_assigned_task");
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

app.use("/project/addAssignedProject", authFromToken, addAssignedProjectRouter);
app.use("/project/assignedInventoryToProject", authFromToken, assignedInventoryToProjectRouter);
app.use("/project/changeAssignedProjectStatus", authFromToken, changeAssignedProjectStatusRouter);
app.use("/project/changeProjectOwner", authFromToken, changeProjectOwnerRouter);
app.use("/project/changeProjectStatus", authFromToken, changeProjectStatusRouter);
app.use("/project/createProject", authFromToken, createProjectRouter);
app.use("/project/getProjectByUser", authFromToken, getProjectByUserRouter);
app.use("/project/getProjectDetails", authFromToken, getProjectDetailsRouter);
app.use("/project/updateAssignedProject", authFromToken, updateAssignedProjectRouter);
app.use("/project/updateProject", authFromToken, updateProjectRouter);

app.use("/task/assignedInventoryToTask", authFromToken, assignedInventoryToTaskRouter);
app.use("/task/changeUserForAssignedTask", authFromToken, changeUserForAssignedTaskRouter);
app.use("/task/createAssignedTask", authFromToken, createAssignedTaskRouter);
app.use("/task/createTask", authFromToken, createTaskRouter);
app.use("/task/removeAssignedTask", authFromToken, removeAssignedTaskRouter);
app.use("/task/updateAssignedTask", authFromToken, updateAssignedTaskRouter);
app.use("/task/updateTask", authFromToken, updateTaskRouter);

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
