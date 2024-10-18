const express = require("express");
const pool = require("../../misc/databaseCon");
const poolQuery = require("../../misc/poolQuery");
const { removeAssignedTask, getTaskById, getAssignedTaskById } = require("./tasks");
const logTransaction = require("../transactions/logTransaction");
const { TransactionTypeEnum, TransactionStatusEnum } = require("../utils/enums");

const removeAssignedTaskRouter = express.Router();

removeAssignedTaskRouter.post("/", async (req, res) => {
    const {
        assigned_task_id,
        task_id,
        remark
    } = req.body.input;

    let created_by = req.idFromToken;

    const requiredFields = [assigned_task_id, task_id];
    for (let i of requiredFields) {
        if (typeof i === "undefined") {
            return res.json({ success: false, message: "Assigned id and task id are required fields" });
        }
    }

    try {
        let assignedTask = await getAssignedTaskById(assigned_task_id);

        if(assignedTask.task_id != task_id){
            return res.json({ success: false, message: "Remove assigned task doesn't match" });
        }

        if(assignedTask.active == false){
            return res.json({ success: false, message: "Task is already removed" });
        }

        let task = await getTaskById(task_id);

        const result = await removeAssignedTask(
            assigned_task_id,
            task_id,
            remark
        );

        logTransaction(TransactionTypeEnum.TASK, TransactionStatusEnum.REMOVE, `Remove Task: ${task.task_name} from ${assignedTask.fk_assigned_to}`, created_by);

        if (result) {
            res.json({
                success: true,
                id: result.id,
                updated_at: result.updated_at,
                message: "Task remove successfully",
            });
        } else {
            res.json({ success: false, message: "Task remove failed" });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

module.exports = removeAssignedTaskRouter;
