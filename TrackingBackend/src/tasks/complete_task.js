const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction");
const { TransactionTypeEnum, InventoryTransactionTypeEnum } = require("../../src/utils/enums");
const _ = require('lodash');
const { createInventoryTransaction, updateInventoryQty } = require("../inventories/inventories");

const completeTaskRouter = express.Router();

completeTaskRouter.post("/", async (req, res) => {
    const {
        task_inventory_id,       // Required field
        completed_date,                // Required field
        remark              // Optional field
    } = req.body.input;

    const created_by = req.idFromToken;

    // Validate required fields
    const requiredFields = [task_inventory_id, completed_date];
    for (let field of requiredFields) {
        if (typeof field === "undefined" || (typeof field === "string" && _.isEmpty(field.trim()))) {
            return res.json({ success: false, message: "Inventory_id, qty, transaction_type are required." });
        }
    }

    const transaction_type = InventoryTransactionTypeEnum.REDUCE;

    try {
        const query = `
        SELECT * 
        FROM task_inventories
        WHERE id = $1
    `;
        const values = [task_inventory_id];

        const task_inventories = await poolQuery(query, values);

        if (task_inventories.rowCount == 0) {
            throw new Error("There is no task inventories")
        }
        
        const inventory_id = task_inventories.rows[0].inventory_id;
        const qty = task_inventories.rows[0].total_qty;

        const result = await createInventoryTransaction(
            inventory_id,
            qty,
            transaction_type,
            remark,
            created_by
        );

        const updateTaskInventory_query = `
        UPDATE task_inventories
        SET is_complete = true,
            completed_date = Now()
        WHERE id = $1
    `;
        const updateTaskInventory_values = [task_inventory_id];

        const updateTaskInventory = await poolQuery(updateTaskInventory_query, updateTaskInventory_values);

        await updateInventoryQty(inventory_id, qty, transaction_type);

        await await logTransaction(TransactionTypeEnum.INVENTORY, InventoryTransactionTypeEnum.REDUCE, `Create inventory transaction - Type: ${transaction_type}`, created_by);

        res.json({
            success: true,
            message: "Inventory transaction created successfully",
            id: result.id,
            created_at: result.created_at
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = completeTaskRouter;
