const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const changeProjectOwnerRouter = express.Router();

changeProjectOwnerRouter.post('/', async (req, res) => {
    const { project_id, old_name, new_name } = req.body.input;  // extract inputs
  
    try {
      // Logic to update project status in your DB (SQL query or ORM call)
      
      // Example: Update project status in your PostgreSQL database
      await changeProjectStatus(old_name, new_name, project_id);
  
      res.json({
        success: true,
        message: "Project status updated successfully"
      });
    } catch (error) {
      res.json({
        success: false,
        message: `Error updating project status: ${error.message}`
      });
    }
  });

async function changeProjectStatus(old_name,new_name, project_id) {
    try {
        const result = await poolQuery(
            `select * from project_histories where id = '${project_id}' and assigned_admin_name = '${old_name}'`
          );
          if (result.rowCount === 0) {
            throw new Error("Assigned project doesn't exist in system!");
          }          

        await poolQuery(`
            UPDATE assigned_projects
            SET  assigned_admin_name = $1
            WHERE project_id = $2 and assigned_admin_name = $3
          `, [new_name,project_id,old_name]);
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = changeProjectOwnerRouter;