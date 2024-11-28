const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const { createAssignedTask,updateTaskStatus } = require("./tasks");
const { TaskStatusEnum } = require("../utils/enums");

const createAssignedTaskRouter = express.Router();

createAssignedTaskRouter.post("/", async (req, res) => {
    const {
        fk_assigned_to,       // Required field
        task_id,              // Required field
        note,                 // Optional field
        start_date_time,      // Optional field
        end_date_time,        // Optional field
        percentage,           // Optional field
        status                // Optional field
    } = req.body.input;

    let created_by = req.idFromToken;

    // Required fields check
    if (!fk_assigned_to || !task_id) {
        return res.json({ success: false, message: "fk_assigned_to and task_id are required." });
    }

    try {
        const result = await createAssignedTask({
            fk_assigned_to,
            task_id,
            note,
            start_date_time,
            end_date_time,
            percentage,
            status,
            created_by
        });

        await updateTaskStatus(task_id, TaskStatusEnum.ASSIGNED);

        res.json({ success: true, message: "Assigned task created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = createAssignedTaskRouter;
