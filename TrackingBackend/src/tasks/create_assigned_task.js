const express = require("express");
const poolQuery = require("../../misc/poolQuery");

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
        res.json({ success: true, message: "Assigned task created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

const createAssignedTask = async (taskData) => {
    const {
        fk_assigned_to,
        task_id,
        note,
        start_date_time,
        end_date_time,
        percentage,
        status,
        created_by
    } = taskData;

    // SQL query to insert a new assigned task
    const query = `
        INSERT INTO assigned_tasks (
            fk_assigned_to,
            task_id,
            note,
            start_date_time,
            end_date_time,
            percentage,
            status,
            created_at,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING id, created_at;
    `;

    const values = [
        fk_assigned_to,
        task_id,
        note,
        start_date_time,
        end_date_time,
        percentage,
        status
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the newly created record's ID and created_at timestamp
};

module.exports = createAssignedTaskRouter;
