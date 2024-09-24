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
        const result = await poolQuery(
            `select id, project_name, project_description, admin_name, start_date, end_date, crated_at, updated_at, actual_start_date, actual_end_date, status
            from project_histories where assigned_admin_name = '${assigned_admin_name}'`
          );
          if (result.rowCount === 0) {
            throw new Error("No project found!");
          } 
          
          return result;                  
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = getProjectsByUserRouter;
