const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const updateReturnInventoryTaskRouter = express.Router();

updateReturnInventoryTaskRouter.post("/", async (req, res) => {
    const {
        id,                    // Required field
        task_inventory_id,      // Required field
        total_qty,              // Required field
        received_qty,           // Required field
        return_qty,             // Required field
        return_date,            // Required field
        receive_admin_name,     // Required field
        return_admin_name,      // Required field
        remark,                 // Required field
        description             // Optional field
    } = req.body.input;

    // Required fields check
    const requiredFields = [id, task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark];
    for (let field of requiredFields) {
        if (typeof field === "undefined") {
            res.json({ success: false, message: "All required fields must be provided." });
            return;
        }
    }

    try {
        const result = await updateReturnInventoryTask({
            id, task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
        });
        res.json({ success: true, message: "Return inventory task updated successfully", id: result.id, updated_at: result.updated_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const updateReturnInventoryTask = async (updateData) => {
    const {
        id, task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
    } = updateData;

    // SQL query to update the return inventory task entry
    const query = `
        UPDATE return_inventory_tasks
        SET
            task_inventory_id = $1,
            total_qty = $2,
            received_qty = $3,
            return_qty = $4,
            return_date = $5,
            receive_admin_name = $6,
            return_admin_name = $7,
            remark = $8,
            description = $9,
            updated_at = NOW()
        WHERE id = $10
        RETURNING id, updated_at;
    `;

    const values = [
        task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description, id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated record's ID and updated_at timestamp
};

module.exports = updateReturnInventoryTaskRouter;
