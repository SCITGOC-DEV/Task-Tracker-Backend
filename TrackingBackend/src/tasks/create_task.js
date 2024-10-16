const express = require("express");
const poolQuery = require("../../misc/poolQuery");

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
            created_by
        });
        res.json({ success: true, message: "Task created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

const createTask = async (taskData) => {
    const {
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
        created_by
    } = taskData;

    // SQL query to insert a new task
    const query = `
        INSERT INTO tasks (
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
            created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, created_at;
    `;

    const values = [
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
        created_by
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the newly created record's ID and created_at timestamp
};

module.exports = createTaskRouter;
