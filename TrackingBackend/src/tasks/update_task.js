const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const { isExistTask, isExistTaskById, getTaskById, getTaskByProjectId } = require("./tasks");

const updateTaskRouter = express.Router();

updateTaskRouter.post("/", async (req, res) => {
    const {
        id,
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
        actual_start_date_time,
        actual_end_date_time
    } = req.body.input;

    const requiredFields = [id, fk_location_name, task_name];
    for (let i of requiredFields) {
        if (typeof i === "undefined") {
            return res.json({ success: false, message: "ID, location name, and task name are required fields" });
        }
    }

    try {

        var taskList = await getTaskByProjectId(fk_project_id)

        const taskExists = taskList.find(task => task.task_name === task_name && task.fk_project_id == fk_project_id && task.id != id); // Check if task_name exists in the taskList

        if (taskExists) {
            res.json({ success: false, message: `Task: ${task_name} is already created.` });
            return;
        }

        const result = await updateTask(
            id,
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
            actual_start_date_time,
            actual_end_date_time
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

const updateTask = async (
    id,
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
    actual_start_date_time,
    actual_end_date_time
) => {


    const query = `
        UPDATE tasks
        SET 
            fk_location_name = $1,
            task_name = $2,
            hardware = $3,
            quantity = $4,
            dispatch = $5,
            note = $6,
            start_date_time = $7,
            end_date_time = $8,
            signature_photo_url = $9,
            start_coords = $10,
            end_coords = $11,
            permit_photo_url = $12,
            percentage = $13,
            status = $14,
            actual_start_date_time = $15,
            actual_end_date_time = $16,
            updated_at = NOW()
        WHERE id = $17
        RETURNING id, updated_at;
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
        actual_start_date_time,
        actual_end_date_time,
        id,
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated task details
};

module.exports = updateTaskRouter;
