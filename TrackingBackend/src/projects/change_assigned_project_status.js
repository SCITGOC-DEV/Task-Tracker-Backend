const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");
const logTransaction = require("../transactions/logTransaction")
const { changeAssignedProjectStatus } = require("./projects.js")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
  TaskStatusEnum, AssignedTaskStatusEnum,
  ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
  TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")

const changeProjectStatusRouter = express.Router();

changeProjectStatusRouter.post('/', async (req, res) => {
  const { project_id, status, actual_start_date, actual_end_date } = req.body.input;  // extract inputs

  try {
    // Logic to update project status in your DB (SQL query or ORM call)

    // Example: Update project status in your PostgreSQL database
    await changeAssignedProjectStatus(status, actual_start_date, actual_end_date, project_id);

    res.json({
      success: true,
      message: "Assigned project status updated successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Error updating project status: ${error.message}`
    });
  }
});

module.exports = changeProjectStatusRouter;