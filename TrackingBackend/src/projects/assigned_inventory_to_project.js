const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const assignedInventoryToProjectRouter = express.Router();

assignedInventoryToProjectRouter.post('/project/assignedInventoryToProject', async (req, res) => {
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
        const result = await poolQuery(
            `select * from inventories where id = '${inventory_id}'`
          );

        if (result.rowCount === 0) {
          throw new Error("No inventory found!");
        }
        
        var qty = result[0].quantity;
        var units_in_stock = result[0].units_in_stock;
        var units_on_request = result[0].units_on_request;
        var total_request = units_on_request + total_qty;
        if(total_request > qty){
          throw new Error("Inventory's quantity is not enough!");
        }    

        await poolQuery(`
            inset into project_inventories(project_id, inventory_id, total_qty,used_qty)
            values($1,$2,$3)
          `, [project_id, inventory_id, total_qty,0]);  
       
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = assignedInventoryToProjectRouter;