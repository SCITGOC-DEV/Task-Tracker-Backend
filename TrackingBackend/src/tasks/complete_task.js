const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction");
const { TransactionTypeEnum, InventoryTransactionTypeEnum } = require("../../src/utils/enums");
const _ = require('lodash');
const { createInventoryTransaction, updateInventoryQty } = require("../inventories/inventories");

const completeTaskRouter = express.Router();

completeTaskRouter.post("/", async (req, res) => {
    const {
        inventory_id,       // Required field
        qty,                // Required field
        remark              // Optional field
    } = req.body.input;

    const created_by = req.idFromToken;

    // Validate required fields
    const requiredFields = [inventory_id, qty];
    for (let field of requiredFields) {
        if (typeof field === "undefined" || (typeof field === "string" && _.isEmpty(field.trim()))) {
            return res.json({ success: false, message: "Inventory_id, qty, transaction_type are required." });
        }
    }

    const transaction_type = InventoryTransactionTypeEnum.REDUCE;

    try {
        const result = await createInventoryTransaction(
            inventory_id,
            qty,
            transaction_type,
            remark,
            created_by
        );

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
