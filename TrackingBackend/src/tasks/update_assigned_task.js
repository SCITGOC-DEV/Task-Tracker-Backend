const express = require("express");
const pool = require("../../misc/databaseCon");
const poolQuery = require("../../misc/poolQuery");
const { TaskStatusEnum } = require("../utils/enums");

const updateAssignedTaskRouter = express.Router();

updateAssignedTaskRouter.post("/", async (req, res) => {
    const {
        id,
        fk_assigned_to,
        task_id,
        note,
        start_date_time,
        end_date_time,
        actual_start_date_time,
        actual_end_date_time,
        percentage,
        status
    } = req.body.input;

    const requiredFields = [id];
    for (let i of requiredFields) {
        if (typeof i === "undefined") {
            return res.json({ success: false, message: "ID is a required field" });
        }
    }

    try {
        const result = await updateAssignedTask(
            id,
            fk_assigned_to,
            task_id,
            note,
            start_date_time,
            end_date_time,
            actual_start_date_time,
            actual_end_date_time,
            percentage,
            status
        );

        if (result) {
            res.json({
                success: true,
                id: result.id,
                updated_at: result.updated_at,
                message: "Task updated successfully",
            });
        } else {
            res.json({ success: false, message: "Task update failed" });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

const updateAssignedTask = async (
    id,
    fk_assigned_to,
    task_id,
    note,
    start_date_time,
    end_date_time,
    actual_start_date_time,
    actual_end_date_time,
    percentage,
    status
) => {

    const assignedTask = await poolQuery(
        `select * from assigned_tasks where id = '${id}' and active = true`
    );

    if (assignedTask.rowCount === 0) {
        throw new Error("No assigend task found!");
    } 
    else if (!assignedTask.rows[0].is_accept_user) {
        throw new Error(`${assignedTask.rows[0].fk_assigned_to} needs to accept this task`);
    }

    const query = `
        UPDATE assigned_tasks
        SET 
            fk_assigned_to = $1,
            task_id = $2,
            note = $3,
            start_date_time = $4,
            end_date_time = $5,
            actual_start_date_time = $6,
            actual_end_date_time = $7,
            percentage = $8,
            status = $9,
            updated_at = NOW()
        WHERE id = $10
        RETURNING id, updated_at;
    `;

    const values = [
        fk_assigned_to,
        task_id,
        note,
        start_date_time,
        end_date_time,
        actual_start_date_time,
        actual_end_date_time,
        percentage,
        status,
        id,
    ];

    const result = await poolQuery(query, values);

    if (result.rowCount > 0) {
        await updateAssignedTaskPercentage(task_id, status);
    }

    return result.rows; // Return the updated task details
};

const updateAssignedTaskPercentage = async (
    task_id,
    status
) => {

    const getAllTaskByTaskId = await poolQuery(
        `select * from assigned_tasks where task_id = '${task_id}' and active = true`
    );

    const total_percentage = getAllTaskByTaskId.rows.reduce((total, task) => parseFloat(total) + parseFloat(task.percentage), 0);
    let current_percentage = total_percentage / getAllTaskByTaskId.rowCount;

    status = current_percentage >= 100 ? TaskStatusEnum.COMPLETED : (current_percentage <= 0 ? TaskStatusEnum.PENDING : TaskStatusEnum.PROGRESSING);
    current_percentage = current_percentage >= 100 ? 100 : current_percentage;

    const updateTaskPercentage = await poolQuery(`
        UPDATE tasks
        SET percentage = $1,
            status = $2
        WHERE id = $3
        `, [current_percentage, status, task_id]);
    return updateTaskPercentage.rows; // Return the updated task details
};

const getAssignedTaskById = async (id) => {
    const query = `
        SELECT *
        FROM assigned_tasks       
        WHERE id = $1 and active = true and is_accept_user = true;
    `;

    const values = [id];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated task details
};

module.exports = updateAssignedTaskRouter;
