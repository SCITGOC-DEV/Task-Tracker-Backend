const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const createReturnInventoryTaskRouter = express.Router();

createReturnInventoryTaskRouter.post("/", async (req, res) => {
    const {
        task_inventory_id,  // Required field
        total_qty,          // Required field
        received_qty,       // Required field
        return_qty,         // Required field
        return_date,        // Required field
        receive_admin_name, // Required field
        return_admin_name,  // Required field
        remark,             // Optional field
        description         // Optional field
    } = req.body.input;

    // Required fields check
    const requiredFields = [task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name];
    for (let field of requiredFields) {
        if (typeof field === "undefined") {
            res.json({ success: false, message: "All required fields must be provided." });
            return;
        }
    }

    try {
        const result = await createReturnInventoryTask({
            task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
        });
        res.json({ success: true, message: "Return inventory task created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const createReturnInventoryTask = async (returnInventoryTaskData) => {
    const {
        task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
    } = returnInventoryTaskData;

    // SQL query to insert a return inventory task entry
    const query = `
        INSERT INTO return_inventory_tasks (
            task_inventory_id,
            total_qty,
            received_qty,
            return_qty,
            return_date,
            receive_admin_name,
            return_admin_name,
            remark,
            description,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, created_at;
    `;

    const values = [
        task_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the inserted record's ID and created_at timestamp
};

module.exports = createReturnInventoryTaskRouter;
