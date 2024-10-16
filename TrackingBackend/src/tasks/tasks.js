const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction")

const isExistTask = async (task_name) => {
    // SQL query to select only the task_name column
    const query = `SELECT task_name FROM tasks WHERE task_name = $1`; // Use parameterized query

    const result = await poolQuery(query, [task_name]);
    return result.rows.length > 0; // Return true if the task exists, false otherwise
};

const isExistTaskById = async (id, task_name) => {
    // SQL query to select only the task_name column
    const query = `SELECT task_name FROM tasks WHERE id <> $1 and task_name = $2`; // Use parameterized query

    const result = await poolQuery(query, [id, task_name]);
    return result.rows.length > 0; // Return true if the task exists, false otherwise
};

const getTaskById = async (id) => {
    // SQL query to select only the task_name column
    const query = `SELECT * FROM tasks WHERE id = $1`; // Use parameterized query

    const result = await poolQuery(query, [id, task_name]);
    return result.rows.length > 0 ? result.rows[0] : null; // Return true if the task exists, false otherwise
};

module.exports = { isExistTask, isExistTaskById, getTaskById };