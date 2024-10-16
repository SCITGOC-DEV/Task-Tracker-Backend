const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction")
const { addAssignedProject } = require("./projects")
const { ProjectStatusEnum, AssignedProjectStatusEnum,
    TaskStatusEnum, AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
    TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")

const addAssignedProjectRouter = express.Router();

addAssignedProjectRouter.post("/", async (req, res) => {
    const {
        project_id, // Required field
        assigned_to, // Required field
        start_date,
        end_date,
        status,
        percentage,
        remark
    } = req.body.input;

    let created_by = req.idFromToken;

    // Required fields check
    if (typeof project_id === "undefined" || typeof assigned_to === "undefined") {
        res.json({ success: false, message: "Project ID and assigned_to are required fields" });
        return;
    }

    try {
        const result = await addAssignedProject({
            project_id, assigned_to, start_date, end_date, status, percentage, remark, created_by
        });

        logTransaction(TransactionTypeEnum.PROJECT, TransactionStatusEnum.ASSIGNED, `Assigned project to ${assigned_to} by ${created_by}.`, created_by);

        res.json({ success: true, message: "Assigned project created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

module.exports = addAssignedProjectRouter;
