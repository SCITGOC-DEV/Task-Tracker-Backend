const poolQuery = require("../../misc/poolQuery.js");
const logTransaction = require("../transactions/logTransaction")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
  TaskStatusEnum, AssignedTaskStatusEnum,
  ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
  TransactionTypeEnum, TransactionStatusEnum } = require("../../src/utils/enums")
const express = require("express");

const assignedInventoryToTaskRouter = express.Router();

assignedInventoryToTaskRouter.post('/', async (req, res) => {
  const { project_id, inventory_id, task_id, total_qty, rent_date, return_date, remark } = req.body.input;  // extract inputs

  try {
    let assigned_by = req.idFromToken;
    await assignedInventoryToTask(project_id, inventory_id, task_id, total_qty, rent_date, return_date, remark, assigned_by);

    const inventory = await poolQuery(
      `select * from inventories where id = '${inventory_id}'`
    );

    if (inventory.rowCount === 0) {
      throw new Error("No inventory found!");
    }
    const task = await poolQuery(
      `select * from tasks where id = '${task_id}'`
    );
    if (inventory.rowCount === 0) {
      throw new Error("No inventory found!");
    }
    await logTransaction(TransactionTypeEnum.TASK, TransactionStatusEnum.ASSIGNED, `Inventory: ${inventory.scit_control_number} assigned to Task: ${task.task_name}.`, assigned_by);

    res.json({
      success: true,
      message: "Assigen inventory to task successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

async function assignedInventoryToTask(project_id, inventory_id, task_id, total_qty, rent_date, return_date, remark,assigned_by) {
  try {
    const result = await poolQuery(
      `select * from project_inventories where project_id = '${project_id}' and inventory_id = '${inventory_id}'`
    );

    if (result.rowCount === 0) {
      throw new Error("No inventory found for this project.");
    }

    var pj_total_qty = result.rows[0].total_qty;
    var pj_used_qty = result.rows[0].used_qty;
    var total_request = pj_used_qty + total_qty;
    var is_return = result.rows[0].is_return;
    let status;
    if (!is_return)
      status = ProjectInventoryStatusEnum.NO_RETURN
    else
      status = ProjectInventoryStatusEnum.NULL

    if (total_request > pj_total_qty) {
      throw new Error("Inventory's quantity is not enough for this project!");
    }

    var date = new Date();
    await poolQuery(`
            INSERT INTO task_inventories(
            project_id,
            inventory_id,
            task_id,
            total_qty,
            rent_date, 
            return_date,
            status,
            remark,
            is_return,
            assigned_by,
            assigned_date)
            VALUES($1, $2 ,$3 ,$4 ,$5 ,$6 ,$7 ,$8 ,$9, $10, $11)
          `, [project_id, inventory_id, task_id, total_qty, rent_date, return_date, status, remark, is_return, assigned_by, date]);

    await poolQuery(`UPDATE project_inventories SET used_qty = ${total_request} WHERE project_id = ${project_id} AND inventory_id = ${inventory_id}`);

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = assignedInventoryToTaskRouter;
