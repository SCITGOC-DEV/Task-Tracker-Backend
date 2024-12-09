const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const { createTask, getTaskByProjectId } = require("./tasks");
const logTransaction = require("../transactions/logTransaction")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
    TaskStatusEnum, AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
    TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")

const createTaskRouter = express.Router();

createTaskRouter.post("/", async (req, res) => {
    const {
        fk_location_name,       // Required field
        task_name,              // Required field
        hardware,               // Optional field
        quantity,               // Optional field
        dispatch,               // Optional field
        note,                   // Optional field
        start_date_time,        // Optional field
        end_date_time,          // Optional field
        signature_photo_url,    // Optional field
        start_coords,           // Optional field
        end_coords,             // Optional field
        permit_photo_url,       // Optional field
        percentage,             // Optional field
        status,                 // Optional field
        fk_project_id           // Required field
    } = req.body.input;

    let created_by = req.idFromToken;

    // Required fields check
    if (!fk_location_name || !task_name || !fk_project_id) {
        return res.json({ success: false, message: "fk_location_name, task_name, and fk_project_id are required." });
    }

    try {
        var taskList = await getTaskByProjectId(fk_project_id)

        const taskExists = taskList.find(task => task.task_name === task_name); // Check if task_name exists in the taskList

        if (taskExists) {
            res.json({ success: false, message: `Task: ${task_name} is already created.` });
            return;
        }

        const result = await createTask({
            fk_location_name,
            task_name,
            hardware,
            quantity,
            dispatch,
            note,
            start_date_time,
            end_date_time,
            signature_photo_url,
            start_coords,
            end_coords,
            permit_photo_url,
            percentage,
            status,
            fk_project_id,
            created_by
        });

        await logTransaction(TransactionTypeEnum.TASK, TransactionStatusEnum.CREATE, `Create task - Task Name: ${task_name}`, created_by);
        res.json({ success: true, message: "Task created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = createTaskRouter;
