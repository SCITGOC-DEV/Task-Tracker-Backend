const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const createReturnedInventoryTaskRouter = express.Router();

createReturnedInventoryTaskRouter.post("/", async (req, res) => {
    const {
        return_inventory_task_id,
        is_approved,
        approve_qty,
        description            // Optional field
    } = req.body.input;

    // Required fields check
    const requiredFields = [return_inventory_task_id, is_approved, approve_qty];
    for (let field of requiredFields) {
        if (typeof field === "undefined") {
            res.json({ success: false, message: "All required fields must be provided." });
            return;
        }
    }

    try {
        let receive_admin_name = req.idFromToken;

        const result = await acceptReturnInventoryTask({
            return_inventory_task_id, is_approved, approve_qty, description, receive_admin_name
        });
        res.json({ success: true, message: `Return inventory task update successfully`, id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const acceptReturnInventoryTask = async (returnInventoryTaskData) => {
    const {
        return_inventory_task_id, is_approved, approve_qty, description, receive_admin_name
    } = returnInventoryTaskData;

    let return_inventory_tasks = await poolQuery(
        `select * from return_inventory_tasks where id = '${return_inventory_task_id}'`
    );

    if (return_inventory_tasks.rowCount == 0) {
        throw new Error("There is no return task inventories")
    }

    const task_inventories = await poolQuery(
        `select * from task_inventories where id = '${return_inventory_tasks.rows[0].task_inventory_id}'`
    );

    if (task_inventories.rowCount == 0) {
        throw new Error("There is no task inventories")
    }

    const total_qty = task_inventories.rows[0].total_qty;

    // SQL query to insert a return inventory task entry
    const query = `
        UPDATE return_inventory_tasks
        SET 
            approve_qty = $1,
            description = $2,
            receive_admin_name = $3,
            is_approved = $4,
            received_date = Now()
        WHERE id = $5
        RETURNING id, created_at;
    `;

    const values = [
        approve_qty, description, receive_admin_name, is_approved, return_inventory_task_id
    ];

    const result = await poolQuery(query, values);

    if (is_approved) {
        return_inventory_tasks = await poolQuery(
            `select * from return_inventory_tasks where id = '${return_inventory_task_id}'`
        );

        const total_returned_qty = return_inventory_tasks.rows.reduce((total, inventory) => total + inventory.approve_qty, 0)

        let actual_return_date = null;

        if (total_qty == total_returned_qty) {
            actual_return_date = new Date();
        }

        // SQL query to insert a return inventory task entry
        const updateInventory_tasks_query = `
        UPDATE task_inventories
        SET 
            total_returned_qty = $1,
            used_qty = total_qty - $2,
            actual_return_date = $3
        WHERE id = $4
        RETURNING id, created_at;
    `;

        const updateInventory_tasks_values = [
            total_returned_qty, total_returned_qty, actual_return_date, return_inventory_tasks.rows[0].task_inventory_id
        ];

        await poolQuery(updateInventory_tasks_query, updateInventory_tasks_values);
    }

    return result.rows[0]; // Return the inserted record's ID and created_at timestamp
};

module.exports = createReturnedInventoryTaskRouter;
