const express = require("express");
const logTransaction = require("../transactions/logTransaction")
const { createProject, isExistProject } = require("./projects")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
    TaskStatusEnum, AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
    TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")

const createProjectRouter = express.Router();

createProjectRouter.post("/", async (req, res) => {
    const {
        project_name,  // Required field
        project_description,
        start_date,
        end_date,
        status,
        percentage
    } = req.body.input;

    let created_by = req.idFromToken;

    // Required fields check
    if (typeof project_name === "undefined") {
        res.json({ success: false, message: "Project name is a required field" });
        return;
    }

    try {

        if (isExistProject(project_name)) {
            res.json({ success: false, message: "Project name is already created." });
            return;
        }

        const result = await createProject({
            project_name, project_description, start_date, end_date, status, percentage, created_by
        });

        logTransaction(TransactionTypeEnum.PROJECT, TransactionStatusEnum.CREATE, `Create project - Project Name: ${project_name}`, created_by);

        res.json({ success: true, message: "Project created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

module.exports = createProjectRouter;
