const express = require("express");
const { createProjectInventoryTransaction } = require("../projects/projects.js")
const { InventoryTransactionTypeEnum } = require("../utils/enums.js");
const _ = require('lodash');

const createReturnInventoryProjectRouter = express.Router();
const logTransaction = require("../transactions/logTransaction")

createReturnInventoryProjectRouter.post('/', async (req, res) => {
  const { project_id, inventory_id, total_qty, requested_at, description } = req.body.input;  // extract inputs

  let request_admin = req.idFromToken;

  try {
    // Validate required fields
    const requiredFields = [project_id, inventory_id, total_qty, requested_at];
    for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
      if (_.isEmpty(fieldValue?.trim())) {
        return res.json({
          success: false,
          message: `Missing required field: ${fieldName}`
        });
      }
    }

    const result = await createProjectInventoryTransaction(project_id, inventory_id, total_qty, request_admin, requested_at, InventoryTransactionTypeEnum.RETURNED, description);

    logTransaction(TransactionTypeEnum.INVENTORY, TransactionStatusEnum.RETURNED, `Inventory : ${result.scit_control_number}  to Project: ${result.project_name}`, request_admin);

    res.json({
      id: result.id,
      created_at: result.created_at,
      success: true,
      message: "Assign inventory to project return successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

module.exports = createReturnInventoryProjectRouter;
