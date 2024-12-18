const express = require("express");
const pool = require("../../misc/databaseCon");
const poolQuery = require("../../misc/poolQuery");
const { TaskStatusEnum } = require("../utils/enums");

const updateAssignedTaskRouter = express.Router();

updateAssignedTaskRouter.post("/", async (req, res) => {
    const {
        id,
        actual_start_date_time,
        actual_end_date_time,
        percentage,
        status,
        remark
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
            actual_start_date_time,
            actual_end_date_time,
            percentage,
            status,
            remark
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
    actual_start_date_time,
    actual_end_date_time,
    percentage,
    status,
    remark
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
        SET actual_start_date_time = $1,
            actual_end_date_time = $2,
            percentage = $3,
            status = $4,
            remark = $5
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, updated_at;
    `;

    const values = [
        actual_start_date_time,
        actual_end_date_time,
        percentage,
        status,
        remark,
        id
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

    const updateProjectTaskPercentage = await poolQuery(`
            UPDATE projects
            SET percentage_task = COALESCE((
                SELECT CAST(AVG(percentage) AS INTEGER)
                FROM tasks
                WHERE tasks.fk_project_id = projects.id
            ), 0)
            WHERE id = (
                SELECT fk_project_id
                FROM tasks
                WHERE id = $1
            );
            `, [task_id]);

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
