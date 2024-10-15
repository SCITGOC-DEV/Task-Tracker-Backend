const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const assignedInventoryToProjectRouter = express.Router();
const { ProjectStatusEnum, AssignedProjectStatusEnum, TaskStatusEnum, AssignedTaskStatusEnum, ProjectInventoryStatusEnum, TaskInventoryStatusEnum } = require("../../src/utils/enums.js")

assignedInventoryToProjectRouter.post('/', async (req, res) => {
  const { project_id, inventory_id, total_qty } = req.body.input;  // extract inputs

  try {
    await assignedInventoryToProject(project_id, inventory_id, total_qty);

    res.json({
      success: true,
      message: "Assigen inventory to project successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

async function assignedInventoryToProject(project_id, inventory_id, total_qty) {
  try {
    const project = await poolQuery(
      `select * from projects where id = '${project_id}'`
    );

    if (project.rowCount === 0) {
      throw new Error("No project found!");
    }

    const inventories = await poolQuery(
      `select * from inventories where id = '${inventory_id}'`
    );

    if (inventories.rowCount === 0) {
      throw new Error("No inventory found!");
    }

    var qty = inventories.rows[0].quantity;
    var units_on_request = inventories.rows[0].units_on_request;
    var total_request = units_on_request + total_qty;
    var is_return = inventories.rows[0].is_return;
    let status;
    if (!is_return)
      status = ProjectInventoryStatusEnum.NO_RETURN
    else
      status = ProjectInventoryStatusEnum.NULL

    if (total_request > qty) {
      throw new Error("Inventory's quantity is not enough!");
    }

    var pj_inv_res = await poolQuery(`
            insert into project_inventories(project_id, inventory_id, total_qty,used_qty, status, is_return)
            values($1,$2,$3,$4,$5)
          `, [project_id, inventory_id, total_qty, 0, status, is_return]);

    await poolQuery(`update inventories set units_on_request = ${total_request} where id = ${inventory_id}`);

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = assignedInventoryToProjectRouter;
