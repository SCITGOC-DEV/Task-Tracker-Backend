const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const updateAssignedProjectRouter = express.Router();

updateAssignedProjectRouter.post("/", async (req, res) => {
    const {
        id, // Required field
        project_id, // Required field
        assigned_to, // Required field
        start_date,
        end_date,
        actual_start_date,
        actual_end_date,
        status,
        percentage,
        remark
    } = req.body.input;

    // Required fields check
    if (typeof id === "undefined" || typeof project_id === "undefined" || typeof assigned_to === "undefined") {
        res.json({ success: false, message: "ID, Project ID, and assigned_to are required fields" });
        return;
    }

    try {
        const result = await updateAssignedProject({
            id, project_id, assigned_to, start_date, end_date, actual_start_date, actual_end_date, status, percentage, remark
        });
        res.json({ success: true, message: "Assigned project updated successfully", id: result.id, updated_at: result.updated_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const updateAssignedProject = async (assignedProjectData) => {
    const {
        id, project_id, assigned_to, start_date, end_date, actual_start_date, actual_end_date, status, percentage, remark
    } = assignedProjectData;

    // SQL query to update an existing assigned project
    const query = `
        UPDATE assigned_projects
        SET 
            project_id = $1,
            assigned_to = $2,
            start_date = $3,
            end_date = $4,
            actual_start_date = $5,
            actual_end_date = $6,
            status = $7,
            percentage = $8,
            remark = $9,
            updated_at = NOW()
        WHERE id = $10
        RETURNING id, updated_at;
    `;

    const values = [
        project_id, assigned_to, start_date, end_date, actual_start_date, actual_end_date, status, percentage, remark, id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated record details (id and updated_at)
};

module.exports = updateAssignedProjectRouter;
