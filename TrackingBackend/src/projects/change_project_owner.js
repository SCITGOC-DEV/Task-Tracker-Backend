const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");
const { changeProjectStatus, addAssignedProject, getAssignedProjectById } = require("./projects")

const changeProjectOwnerRouter = express.Router();

changeProjectOwnerRouter.post('/', async (req, res) => {
  const { project_id, old_name, new_name } = req.body.input;  // extract inputs

  try {
    // Logic to update project status in your DB (SQL query or ORM call)
    let assignedProject = await getAssignedProjectById(project_id);
    // Example: Update project status in your PostgreSQL database
    await changeProjectStatus(old_name, new_name, project_id);

    const changeAssigned = await addAssignedProject({
      project_id,
      new_name,
      start_date: assignedProject.start_date,
      end_date: assignedProject.end_date,
      status: assignedProject.status,
      percentage: assignedProject.percentage,
      remark: assignedProject.remark,
      created_by
    });

    await logTransaction(TransactionTypeEnum.PROJECT, TransactionStatusEnum.ASSIGNED, `Change project owner to ${new_name} by ${old_name}`, created_by);
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

module.exports = changeProjectOwnerRouter;