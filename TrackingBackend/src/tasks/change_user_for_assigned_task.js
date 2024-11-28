const express = require("express");
const pool = require("../../misc/databaseCon");
const poolQuery = require("../../misc/poolQuery");
const { createAssignedTask, removeAssignedTask, getTaskById, getAssignedTaskById } = require("./tasks");
const logTransaction = require("../transactions/logTransaction");
const { TransactionTypeEnum, TransactionStatusEnum } = require("../utils/enums");

const changeUserForAssignedTaskRouter
    = express.Router();

changeUserForAssignedTaskRouter.post("/", async (req, res) => {
    const {
        assigned_task_Id,
        new_fk_assigned_to,
        task_id,
        note,
        remark
    } = req.body.input;

    let created_by = req.idFromToken;

    const requiredFields = [assigned_task_Id, task_id, new_fk_assigned_to];
    for (let i of requiredFields) {
        if (typeof i === "undefined") {
            return res.json({ success: false, message: "Assigned id, task id and new_fk_assigned_to are required fields" });
        }
    }

    try {
        let assignedTask = await getAssignedTaskById(assigned_task_Id);

        if (assignedTask == null) {
            return res.json({ success: false, message: "There is no assigned task." });
        }

        if (assignedTask.task_id != task_id) {
            return res.json({ success: false, message: "Remove assigned task doesn't match" });
        }        

        if(assignedTask.active == false){
            return res.json({ success: false, message: "Task is already changed" });
        }

        if (assignedTask.fk_assigned_to == new_fk_assigned_to) {
            return res.json({ success: false, message: "User is already assigned" });
        }

        let task = await getTaskById(task_id);

        const result = await removeAssignedTask(
            assigned_task_Id,
            task_id,
            remark
        );

        let fk_assigned_to = new_fk_assigned_to;
        let start_date_time = assignedTask.start_date_time;
        let end_date_time = assignedTask.end_date_time;
        let percentage = assignedTask.percentage;
        let status = assignedTask.status;

        const newTask = await createAssignedTask({
            fk_assigned_to,
            task_id,
            note,
            start_date_time,
            end_date_time,
            percentage,
            status,
            created_by,
            remark
        });

        logTransaction(TransactionTypeEnum.TASK, TransactionStatusEnum.CHANGE, `Change assigned task from ${assignedTask.fk_assigned_to} to ${new_fk_assigned_to} `, created_by);

        if (result) {
            res.json({
                success: true,
                id: result.id,
                updated_at: result.updated_at,
                message: "Task change successfully",
            });
        } else {
            res.json({ success: false, message: "Task change failed" });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

module.exports = changeUserForAssignedTaskRouter;
