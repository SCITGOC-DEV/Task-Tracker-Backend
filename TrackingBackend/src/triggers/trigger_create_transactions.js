const poolQuery = require("../../misc/poolQuery.js");
const express = require("express");

const createTransactionRouter = express.Router();

createTransactionRouter.post('/', async (req, res) => {
  try {
    const table = req.body.table.name;
    const op = req.body.event.op;
    const created_by = req.idFromToken;

    var transaction_type = ""
    var action = ""
    var remark = ""
    if (table == "projects") {
      transaction_type = "Project";

      if (op == "INSERT") {
        action = "Create"
        remark = "Project Name : " + req.body.event.data.new.project_name;
        await createTransaction(transaction_type, action, remark, created_by);
      } else if (op == "UPDATE") {
        action = "Update"
        var project = req.body.event.data.new.project_name;
        var old_status = req.body.event.data.old.status;
        var new_status = req.body.event.data.new.status;
        if (old_status != new_status) {
          remark = "Project status change : " + project + " is " + new_status;
          await createTransaction(transaction_type, action, remark, created_by);
        }
      }
    } else if (table == "tasks") {
      action = "Create"
      remark = "Task Name : " + req.body.event.data.new.task_name;
      await createTransaction(transaction_type, action, remark, created_by);
    }
    res.json({
      success: true,
      message: "Create transaction successfully!"
    });
  } catch (error) {
    res.json({
      success: false,
      message: `${error.message}`
    });
  }
});

async function createTransaction(transaction_type, action, remark, created_by) {
  try {
    await poolQuery(`
      insert into transactions(transaction_type, action, remark, created_by)
      values($1,$2,$3,$4)
    `, [transaction_type, action, remark, created_by]);

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = createTransactionRouter;
