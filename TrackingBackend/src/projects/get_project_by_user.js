const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const getProjectsByUserRouter = express.Router();

getProjectsByUserRouter.post('/', async (req, res) => {
    const { assigned_admin_name } = req.body.input;  // extract inputs
  
    try {
      const result = await getProjectsByUser(assigned_admin_name);
  
      res.json({
        project : result,
        success: true,
        message: "Successful!"
      });
    } catch (error) {
      res.json({
        project: null,
        success: false,
        message: `${error.message}`
      });
    }
  });

async function getProjectsByUser(assigned_admin_name) {
    try {
        // Get all project IDs from project_histories for the specified admin
        const projectHistoriesResult = await poolQuery(
          `SELECT project_id FROM assigned_projects WHERE assigned_admin_name = $1`, 
          [assigned_admin_name]  // Use parameterized queries to prevent SQL injection
      );

      if (projectHistoriesResult.rowCount === 0) {
          throw new Error("No projects found!");
      }

      // Extract all project_ids into an array
      const projectIds = projectHistoriesResult.rows.map(row => row.project_id);

      // If you want to query the projects table using those project_ids
      const projectsResult = await poolQuery(
          `SELECT id, project_name, project_description, admin_name, start_date, end_date, crated_at, updated_at, actual_start_date, actual_end_date, status
           FROM projects WHERE project_id = ANY($1)`, 
          [projectIds]  // Pass the array of project IDs to the query
      );

      if (projectsResult.rowCount === 0) {
          throw new Error("No matching projects found!");
      }

      // Return the resulting project data
      return projectsResult.rows;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = getProjectsByUserRouter;
