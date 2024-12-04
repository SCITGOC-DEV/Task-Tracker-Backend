const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");
const _ = require('lodash');

const acceptReturnedInventoryToProjectRouter = express.Router();
const logTransaction = require("../transactions/logTransaction.js");
const { TransactionStatusEnum } = require("../utils/enums.js");

acceptReturnedInventoryToProjectRouter.post('/', async (req, res) => {
  const { project_inventory_transaction_id, approved_qty, is_approved, remark } = req.body.input;  // extract inputs

  let approved_admin = req.idFromToken;

  try {
    // Validate required fields
    const requiredFields = [project_inventory_transaction_id, approved_qty, is_approved];
    for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
      if (_.isEmpty(fieldValue?.trim())) {
        return res.json({
          success: false,
          message: `Missing required field: ${fieldName}`
        });
      }
    }

    const result = await acceptReturnedInventoryToProject(project_inventory_transaction_id, approved_qty, approved_admin, is_approved, remark);

    let status = is_approved ? TransactionStatusEnum.APPROVED : TransactionStatusEnum.REJECT;

    logTransaction(TransactionTypeEnum.INVENTORY, is_approved, `Inventory : ${result.scit_control_number}  to Project: ${result.project_name}'s ${result.transaction_type} is ${is_approved}`, request_admin);

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

    if (project.rowCount === 0) {
      throw new Error("No project inventory transaction found!");
    }

    const project = await poolQuery(
      `select * from projects where id = '${project_inventory_transaction.project_id}'`
    );

    if (project.rowCount === 0) {
      throw new Error("No project found!");
    }

    const inventories = await poolQuery(
      `select * from inventories where id = '${project_inventory_transaction.inventory_id}'`
    );

    if (inventories.rowCount === 0) {
      throw new Error("No inventory found!");
    }

    var pj_inv_res = await poolQuery(`
      UPDATE project_inventory_transactions
      SET  approved_qty = $1,
           approved_admin = $2, 
           is_approved = $3, 
           remark = $4,
           approved_at = $5
           updated_at = $5
      WHERE id = $6
    `, [approved_qty, approved_admin, is_approved, remark, date, project_inventory_transaction_id]);

    if (approved_qty > 0) {
      var units_on_request = inventories.rows[0].units_on_request;
      var update_total_request = units_on_request - approved_qty;
      await poolQuery(`update inventories set units_on_request = ${update_total_request} where id = ${inventory_id}`);
    }
    return {
      scit_control_number: inventories.scit_control_number,
      project_name: project.project_name,
      transaction_type: project_inventory_transaction.transaction_type
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = acceptReturnedInventoryToProjectRouter;