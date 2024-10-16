const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");
const { assignedInventoryToProject } = require("./projects.js")

const assignedInventoryToProjectRouter = express.Router();
const logTransaction = require("../transactions/logTransaction")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
  TaskStatusEnum, AssignedTaskStatusEnum,
  ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
  TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")

assignedInventoryToProjectRouter.post('/', async (req, res) => {
  const { project_id, inventory_id, total_qty } = req.body.input;  // extract inputs
  let created_by = req.idFromToken;
  
  try {
    const result = await assignedInventoryToProject(project_id, inventory_id, total_qty, created_by);

    logTransaction(TransactionTypeEnum.PROJECT, TransactionStatusEnum.ADD, `Add inventory : ${result.scit_control_number}  to Project: ${result.project_name}`, created_by);

    res.json({
      success: true,
      message: "Assigen inventory to project successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

module.exports = assignedInventoryToProjectRouter;
