const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction")
const { updateProject, isExistProjectById, getProjectById } = require("./projects")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
    TaskStatusEnum, AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
    TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")

const updateProjectRouter = express.Router();

updateProjectRouter.post("/", async (req, res) => {
    const {
        id, // Required field
        project_name, // Required field
        project_description,
        start_date,
        end_date,
        status,
        actual_start_date,
        actual_end_date,
        percentage
    } = req.body.input;

    let created_by = req.idFromToken;

    // Required fields check
    if (typeof id === "undefined" || typeof project_name === "undefined") {
        res.json({ success: false, message: "Project ID and project name are required fields" });
        return;
    }

    try {
        if (await isExistProjectById(id, project_name)) {
            res.json({ success: false, message: "Project name is already created." });
            return;
        }

        let project = await getProjectById(id);
        if (project == null) {
            res.json({ success: false, message: "Project doesn't exist." });
            return;
        }

        const result = await updateProject({
            id, project_name, project_description, start_date, end_date, status, actual_start_date, actual_end_date, percentage
        });

        if (project.status != status)
            await logTransaction(TransactionTypeEnum.PROJECT, TransactionStatusEnum.CHANGE, `Update project -  Status : ${project.status} to ${status}.`, created_by);
        else
            await logTransaction(TransactionTypeEnum.PROJECT, TransactionStatusEnum.UPDATE, `Update project.`, created_by);

        res.json({ success: true, message: "Project updated successfully", id: result.id, updated_at: result.updated_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

module.exports = updateProjectRouter;
