const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const { getAssignedTaskById } = require("./tasks");

const acceptAssignedTaskRouter = express.Router();

acceptAssignedTaskRouter.post("/", async (req, res) => {
    const {
        task_id,
        assigned_task_id,
        is_accept_user,
        remark
    } = req.body.input;

    const requiredFields = [task_id, assigned_task_id, is_accept_user, remark];
    for (let i of requiredFields) {
        if (typeof i === "undefined") {
            return res.json({ success: false, message: "task_id, assigned_task_id, is_accept_user are required fields" });
        }
    }

    try {

        var assignedTask = await getAssignedTaskById(assigned_task_id);

        if (assignedTask == null) {
            return res.json({ success: false, message: "There is no assigned task." });
        }

        if(assignedTask.task_id != task_id){
            return res.json({ success: false, message: "Assigned task doesn't match" });
        }

        const result = await updateAssignedTask(
            task_id,
            assigned_task_id,
            is_accept_user,
            remark
        );

        if (result) {
            res.json({
                success: true,
                id: result.id,
                updated_at: result.updated_at,
                message: "Task updated successfully",
            });
        } else {
            res.json({ success: false, message: "Task update failed" });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

const updateAssignedTask = async (
        task_id,
        assigned_task_id,
        is_accept_user,
        remark
) => {

    const query = `
        UPDATE assigned_tasks
        SET 
            is_accept_user = $1,
            remark = $2,
            accepted_at = = NOW(),
            updated_at = NOW()
        WHERE task_id = $3 and assigned_task_id = $4
        RETURNING id, updated_at;
    `;

    const values = [
        is_accept_user,
        remark,
        task_id,
        assigned_task_id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated task details
};

module.exports = acceptAssignedTaskRouter;
