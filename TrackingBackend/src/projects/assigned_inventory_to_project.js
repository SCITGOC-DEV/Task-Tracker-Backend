const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const assignedInventoryToProjectRouter = express.Router();

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
    if (total_request > qty) {
      throw new Error("Inventory's quantity is not enough!");
    }

    await poolQuery(`
            insert into project_inventories(project_id, inventory_id, total_qty,used_qty, is_return)
            values($1,$2,$3,$4)
          `, [project_id, inventory_id, total_qty, 0, is_return]);

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = assignedInventoryToProjectRouter;
