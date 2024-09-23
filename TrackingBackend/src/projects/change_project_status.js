const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const changeProjectStatusRouter = express.Router();

changeProjectStatusRouter.post('/project/ChangeProjectStatus', async (req, res) => {
    const { project_id, status, acual_start_date, acual_end_date } = req.body.input;  // extract inputs
  
    try {
      // Logic to update project status in your DB (SQL query or ORM call)
      
      // Example: Update project status in your PostgreSQL database
      await changeProjectStatus(status, acual_start_date, acual_end_date, project_id);
  
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

async function changeProjectStatus(status, acual_start_date, acual_end_date, project_id) {
    try {
        const result = await poolQuery(
            `select * from projects where id = '${project_id}'`
          );
          if (result.rowCount === 0) {
            throw new Error("Project doesn't exist in system!");
          }          

        await poolQuery(`
            UPDATE projects
            SET status = $1, actual_start_date = $2, actual_end_date = $3
            WHERE project_id = $4
          `, [status, acual_start_date, acual_end_date, project_id]);
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = changeProjectStatusRouter;
