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
const acceptAssignedTaskRouter = require("./src/tasks/accept_assigned_task");

const createTransactionRouter = require("./src/triggers/trigger_create_transactions");

const createInventoryRouter = require("./src/inventories/create_inventory");
const createReturnInventoryProjectRouter = require("./src/inventories/create_return_inventory_project ");
const createReturnInventoryTaskRouter = require("./src/inventories/create_return_inventory_task");
const updateInventoryRouter = require("./src/inventories/update_inventory");
const updateReturnInventoryProjectRouter = require("./src/inventories/update_return_inventory_project");
const updateReturnInventoryTaskRouter = require("./src/inventories/update_return_inventory_task");
const acceptAssignedInventoryToProjectRouter = require("./src/inventories/accept_assigned_inventory_to_project");
const acceptReturnedInventoryToProjectRouter = require("./src/inventories/accept_returned_inventory_project");


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

app.use("/project/addAssignedProject", authFromToken, verifyAdminRoles(['admin']), addAssignedProjectRouter);
app.use("/project/assignedInventoryToProject", authFromToken, verifyAdminRoles(['projectadmin']), assignedInventoryToProjectRouter);
app.use("/project/changeAssignedProjectStatus", authFromToken, verifyAdminRoles(['projectadmin']), changeAssignedProjectStatusRouter);
app.use("/project/changeProjectOwner", authFromToken, verifyAdminRoles(['admin']), changeProjectOwnerRouter);
app.use("/project/changeProjectStatus", authFromToken, verifyAdminRoles(['admin']), changeProjectStatusRouter);
app.use("/project/createProject", authFromToken, verifyAdminRoles(['admin']), createProjectRouter);
app.use("/project/getProjectByUser", authFromToken, getProjectByUserRouter);
app.use("/project/getProjectDetails", authFromToken, getProjectDetailsRouter);
app.use("/project/updateAssignedProject", authFromToken, verifyAdminRoles(['admin, projectadmin']), updateAssignedProjectRouter);
app.use("/project/updateProject", authFromToken, verifyAdminRoles(['admin, projectadmin']), updateProjectRouter);

app.use("/task/assignedInventoryToTask", authFromToken, verifyAdminRoles(['projectadmin']), assignedInventoryToTaskRouter);
app.use("/task/changeUserForAssignedTask", authFromToken, verifyAdminRoles(['projectadmin']), changeUserForAssignedTaskRouter);
app.use("/task/createAssignedTask", authFromToken, verifyAdminRoles(['projectadmin']), createAssignedTaskRouter);
app.use("/task/createTask", authFromToken, verifyAdminRoles(['projectadmin']), createTaskRouter);
app.use("/task/removeAssignedTask", authFromToken, verifyAdminRoles(['projectadmin']), removeAssignedTaskRouter);
app.use("/task/updateAssignedTask", authFromToken, verifyAdminRoles(['projectadmin', 'user']), updateAssignedTaskRouter);
app.use("/task/updateTask", authFromToken, verifyAdminRoles(['projectadmin']), updateTaskRouter);
app.use("/task/acceptAssignedTask", authFromToken, verifyAdminRoles(['user']), acceptAssignedTaskRouter);

app.use("/trigger/createTransaction", createTransactionRouter);

app.use("/inventory/createInventory", authFromToken, verifyAdminRoles(['admin']), createInventoryRouter);
app.use("/inventory/createReturnInventoryProject", authFromToken, verifyAdminRoles(['projectadmin']), createReturnInventoryProjectRouter);
app.use("/inventory/createReturnInventoryTask", authFromToken, verifyAdminRoles(['user']), createReturnInventoryTaskRouter);
app.use("/inventory/updateInventory", authFromToken, verifyAdminRoles(['admin']), updateInventoryRouter);
app.use("/inventory/updateReturnInventoryProject", authFromToken, verifyAdminRoles(['projectadmin']), updateReturnInventoryProjectRouter);
app.use("/inventory/updateReturnInventoryTask", authFromToken, verifyAdminRoles(['user']), updateReturnInventoryTaskRouter);
app.use("/inventory/acceptAssignedInventoryToProject", authFromToken, verifyAdminRoles(['admin']), acceptAssignedInventoryToProjectRouter);
app.use("/inventory/acceptReturnedInventoryToProject", authFromToken, verifyAdminRoles(['admin']), acceptReturnedInventoryToProjectRouter);

app.listen(3000, () => {
  console.log("Server is listening at port 3000");
});
