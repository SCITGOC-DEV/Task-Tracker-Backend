const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");
const _ = require('lodash');

const acceptReturnedInventoryToProjectRouter = express.Router();
const logTransaction = require("../transactions/logTransaction.js");
const { TransactionStatusEnum, TransactionTypeEnum, InventoryTransactionTypeEnum } = require("../utils/enums.js");

acceptReturnedInventoryToProjectRouter.post('/', async (req, res) => {
  const { project_inventory_transaction_id, approved_qty, is_approved, remark } = req.body.input;  // extract inputs

  let approved_admin = req.idFromToken;

  try {
    // Validate required fields
    const requiredFields = [project_inventory_transaction_id, approved_qty, is_approved];
    for (let field of requiredFields) {
      if (typeof field === "undefined" || (typeof field === "string" && _.isEmpty(field.trim()))) {
        return res.json({ success: false, message: "Missing required fields (project_inventory_transaction_id, approved_qty, is_approved)." });
      }
    }

    const result = await acceptReturnedInventoryToProject(project_inventory_transaction_id, approved_qty, approved_admin, is_approved, remark);

    let status = is_approved ? TransactionStatusEnum.APPROVED : TransactionStatusEnum.REJECT;

    logTransaction(TransactionTypeEnum.INVENTORY, status, `Inventory : ${result.scit_control_number}  to Project: ${result.project_name}'s ${result.transaction_type} is ${status}`, approved_admin);

    res.json({
      success: true,
      message: `Assign inventory to project ${status} successfully`
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

async function acceptReturnedInventoryToProject(project_inventory_transaction_id, approved_qty, approved_admin, is_approved, remark) {
  try {
    const project_inventory_transaction = await poolQuery(
      `select * from project_inventory_transactions where id = '${project_inventory_transaction_id}'`
    );

    if (project_inventory_transaction.rowCount === 0) {
      throw new Error("No project inventory transaction found!");
    }

    if (project_inventory_transaction.rows[0].is_approved) {
      throw new Error("Inventory was already approved.");
    }

    if (project_inventory_transaction.rows[0].transaction_type != InventoryTransactionTypeEnum.RETURNED) {
      throw new Error("Wrong transaction type.");
    }

    const project = await poolQuery(
      `select * from projects where id = '${project_inventory_transaction.rows[0].project_id}'`
    );

    if (project.rowCount === 0) {
      throw new Error("No project found!");
    }

    const inventories = await poolQuery(
      `select * from inventories where id = '${project_inventory_transaction.rows[0].inventory_id}'`
    );

    if (inventories.rowCount === 0) {
      throw new Error("No inventory found!");
    }
    var date = new Date();
    var pj_inv_res = await poolQuery(`
      UPDATE project_inventory_transactions
      SET  approved_qty = $1,
           approved_admin = $2, 
           is_approved = $3, 
           remark = $4,
           approved_at = $5,
           updated_at = $6
      WHERE id = $7
    `, [approved_qty, approved_admin, is_approved, remark, date, date, project_inventory_transaction_id]);

    if (approved_qty > 0) {
      var units_on_request = inventories.rows[0].units_on_request;
      var update_total_request = units_on_request - approved_qty;

      var update_pj_inv_res = await poolQuery(`
        UPDATE project_inventories
        SET total_qty = total_qty - $1
        WHERE project_id = $2 and inventory_id = $3
      `, [approved_qty, project_inventory_transaction.rows[0].project_id, project_inventory_transaction.rows[0].inventory_id]);

      await poolQuery(`update inventories set units_on_request = ${update_total_request} where id = ${project_inventory_transaction.rows[0].inventory_id}`);
    }
    return {
      scit_control_number: inventories.rows[0].scit_control_number,
      project_name: project.rows[0].project_name,
      transaction_type: project_inventory_transaction.rows[0].transaction_type
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = acceptReturnedInventoryToProjectRouter;
