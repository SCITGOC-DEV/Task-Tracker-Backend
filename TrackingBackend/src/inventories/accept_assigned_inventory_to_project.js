const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");
const { acceptAssignedInventoryToProject } = require("../projects/projects.js")
const _ = require('lodash');

const acceptAssignedInventoryToProjectRouter = express.Router();
const logTransaction = require("../transactions/logTransaction.js");
const { TransactionStatusEnum, TransactionTypeEnum } = require("../utils/enums.js");

acceptAssignedInventoryToProjectRouter.post('/', async (req, res) => {
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

    const result = await acceptAssignedInventoryToProject(project_inventory_transaction_id, approved_qty, approved_admin, is_approved, remark);
    
    let status = is_approved ? TransactionStatusEnum.APPROVED : TransactionStatusEnum.REJECT;
    
    logTransaction(TransactionTypeEnum.INVENTORY, status, `Inventory : ${result.scit_control_number}  to Project: ${result.project_name}'s ${result.transaction_type} is ${status}`, approved_admin);

    res.json({
      success: true,
      message: "Assign inventory to project update successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

async function updateProjectAndInventory(project_inventory_transaction_id) {
  try {

    const project_inventory_transaction = await poolQuery(
      `select * from project_inventory_transactions where id = '${project_inventory_transaction_id}'`
    );

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

    var units_on_request = inventories.rows[0].units_on_request;
    var total_request = units_on_request + approved_qty;

    await poolQuery(`update inventories set units_on_request = ${total_request} where id = ${inventory_id}`);

    return {
      scit_control_number: inventories.scit_control_number,
      project_name: project.project_name,
      transaction_type: project_inventory_transaction.transaction_type
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = acceptAssignedInventoryToProjectRouter;
