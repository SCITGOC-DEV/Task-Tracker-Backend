const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const getProjectDetailsRouter = express.Router();

getProjectDetailsRouter.post('/', async (req, res) => {
  try {
    const result = await getProjectDetails();

    res.json({
      projects: result,
      success: true,
      message: "Successful!"
    });
  } catch (error) {
    res.json({
      projects: null,
      success: false,
      message: `${error.message}`
    });
  }
});

async function getProjectDetails() {
  try {
    const projectsResult = await poolQuery(
      `SELECT
              p.project_name,
              t.task_name,
              ic.model_type,
              i.serial_number,
              i.serial_number_start,
              i.serial_number_end,
              i.scit_control_number
          FROM
              task_inventories ti
          Left JOIN
              tasks t on t.id = ti.task_id
          INNER JOIN
              projects p on t.fk_project_id = p.id
          INNER JOIN
              inventories i ON i.id = ti.inventory_id
          LEFT JOIN
              inventory_categories ic ON ic.id = i.inventory_category_id
          ORDER BY
              p.project_name, t.task_name, i.serial_number;
        `);

    if (projectsResult.rowCount === 0) {
      throw new Error("No result found!");
    }

    // Map the resulting rows to include only the necessary fields
    const projects = projectsResult.rows.map(row => ({
      scit_control_number: row.scit_control_number,
      serial_number: row.serial_number,
      serial_number_start: row.serial_number_start,
      serial_number_end: row.serial_number_end,
      project_name: row.project_name,
      task_name: row.task_name,
      model_type: row.model_type
    }));

    // Log the projects for debugging
    console.log("Mapped projects:", projects);

    return projects;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = getProjectDetailsRouter;
