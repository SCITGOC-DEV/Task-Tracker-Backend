const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const createReturnInventoryTaskRouter = express.Router();

createReturnInventoryTaskRouter.post("/", async (req, res) => {
    const {
        task_inventory_id,  // Required field
        return_qty,         // Required field
        return_date,        // Required field
        remark            // Optional field
    } = req.body.input;

    // Required fields check
    const requiredFields = [task_inventory_id, return_qty, return_date];
    for (let field of requiredFields) {
        if (typeof field === "undefined") {
            res.json({ success: false, message: "All required fields must be provided." });
            return;
        }
    }

    try {
        let return_user_name = req.idFromToken;

        const result = await createReturnInventoryTask({
            task_inventory_id, return_qty, return_date, return_user_name, remark
        });
        res.json({ success: true, message: "Return inventory task created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const createReturnInventoryTask = async (returnInventoryTaskData) => {
    const {
        task_inventory_id, return_qty, return_date, return_user_name, remark
    } = returnInventoryTaskData;

    const task_inventories = await poolQuery(
        `select * from task_inventories where id = '${task_inventory_id}'`
    );

    if (task_inventories.rowCount == 0) {
        throw new Error("There is no task inventories")
    }

    const total_qty = task_inventories.rows[0].total_qty;
    const total_return_qty = task_inventories.rows[0].total_returned_qty;

    // SQL query to insert a return inventory task entry
    const query = `
        INSERT INTO return_inventory_tasks (
            task_inventory_id,
            total_qty,
            total_returned_qty,
            return_qty,
            return_date,
            return_user_name,
            remark,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, created_at;
    `;

    const values = [
        task_inventory_id, total_qty, total_return_qty, return_qty, return_date, return_user_name, remark
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the inserted record's ID and created_at timestamp
};

module.exports = createReturnInventoryTaskRouter;
