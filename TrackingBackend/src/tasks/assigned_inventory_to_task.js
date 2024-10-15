const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const assignedInventoryToTaskRouter = express.Router();
const { ProjectStatusEnum, AssignedProjectStatusEnum, TaskStatusEnum, AssignedTaskStatusEnum, ProjectInventoryStatusEnum, TaskInventoryStatusEnum } = require("../../src/utils/enums.js")

assignedInventoryToTaskRouter.post('/', async (req, res) => {
  const { project_id, inventory_id, task_id, total_qty, rent_date, return_date, qty, remark, request_user_name, request_date } = req.body.input;  // extract inputs

  try {
    await assignedInventoryToTask(project_id, inventory_id, task_id, total_qty, rent_date, return_date, qty, remark, request_user_name, request_date);

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

async function assignedInventoryToTask(project_id, inventory_id, task_id, total_qty, rent_date, return_date, qty, remark, request_user_name, request_date) {
  try {
    const result = await poolQuery(
      `select * from project_inventories where project_id = '${project_id}' and inventory_id = '${inventory_id}'`
    );

    if (result.rowCount === 0) {
      throw new Error("No inventory found!");
    }

    var total_qty = result.rows[0].total_qty;
    var used_qty = result.rows[0].used_qty;
    var total_request = used_qty + qty;
    var is_return = result.rows[0].is_return;
    let status;
    if (!is_return)
      status = ProjectInventoryStatusEnum.NO_RETURN
    else
      status = ProjectInventoryStatusEnum.NULL

    if (total_request > total_qty) {
      throw new Error("Inventory's quantity is not enough!");
    }

    await poolQuery(`
            insert into task_inventories(project_id,inventory_id,task_id,total_qty,rent_date,return_date,qty,status,remark,request_user_name,request_date, is_return)
            values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          `, [project_id, inventory_id, task_id, total_qty, rent_date, return_date, qty, status, remark, request_user_name, request_date, is_return]);

    await poolQuery(`update project_inventories set used_qty = ${total_request} where project_id = ${project_id} and inventory_id = ${inventory_id}`);

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = assignedInventoryToTaskRouter;
