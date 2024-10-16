const express = require("express");
const pool = require("../../misc/databaseCon");
const poolQuery = require("../../misc/poolQuery");

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
    return result.rows[0]; // Return the updated task details
};

module.exports = updateAssignedTaskRouter;
