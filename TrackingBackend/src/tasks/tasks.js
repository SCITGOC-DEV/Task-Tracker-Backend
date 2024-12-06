const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction")

const isExistTask = async (task_name) => {
    // SQL query to select only the task_name column
    const query = `SELECT task_name FROM tasks WHERE task_name = $1`; // Use parameterized query

    const result = await poolQuery(query, [task_name]);
    return result.rowCount > 0; // Return true if the task exists, false otherwise
};

const isExistTaskById = async (id, task_name) => {
    // SQL query to select only the task_name column
    const query = `SELECT task_name FROM tasks WHERE id <> $1 and task_name = $2`; // Use parameterized query

    const result = await poolQuery(query, [id, task_name]);
    return result.rowCount > 0; // Return true if the task exists, false otherwise
};

const getTaskById = async (id) => {
    // SQL query to select only the task_name column
    const query = `SELECT * FROM tasks WHERE id = $1`; // Use parameterized query

    const result = await poolQuery(query, [id]);
    return result.rowCount > 0 ? result.rows[0] : []; // Return true if the task exists, false otherwise
};

const getTaskByProjectId = async (fk_project_id) => {
    // SQL query to select only the task_name column
    const query = `SELECT * FROM tasks WHERE fk_project_id = $1`; // Use parameterized query

    const result = await poolQuery(query, [fk_project_id]);
    return result.rowCount > 0 ? result.rows : []; // Return true if the task exists, false otherwise
};

const getAssignedTaskById = async (id) => {
    // SQL query to select only the task_name column
    const query = `SELECT * FROM assigned_tasks WHERE id = $1`; // Use parameterized query

    const result = await poolQuery(query, [id]);
    return result.rowCount > 0 ? result.rows[0] : null; // Return true if the task exists, false otherwise
};

const createTask = async (taskData) => {
    const {
        fk_location_name,
        task_name,
        hardware,
        quantity,
        dispatch,
        note,
        start_date_time,
        end_date_time,
        signature_photo_url,
        start_coords,
        end_coords,
        permit_photo_url,
        percentage,
        status,
        fk_project_id,
        created_by
    } = taskData;

    // SQL query to insert a new task
    const query = `
        INSERT INTO tasks (
            fk_location_name,
            task_name,
            hardware,
            quantity,
            dispatch,
            note,
            start_date_time,
            end_date_time,
            signature_photo_url,
            start_coords,
            end_coords,
            permit_photo_url,
            percentage,
            status,
            fk_project_id,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, created_at;
    `;

    const values = [
        fk_location_name,
        task_name,
        hardware,
        quantity,
        dispatch,
        note,
        start_date_time,
        end_date_time,
        signature_photo_url,
        start_coords,
        end_coords,
        permit_photo_url,
        percentage,
        status,
        fk_project_id,
        created_by
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the newly created record's ID and created_at timestamp
};

const updateTaskStatus = async (
    task_id,
    status
) => {

    const query = `
    UPDATE tasks
    SET 
        status = $1,        
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, updated_at;
`;

    const values = [
        status,
        task_id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated task details
};

const createAssignedTask = async (taskData) => {
    const {
        fk_assigned_to,
        task_id,
        note,
        start_date_time,
        end_date_time,
        percentage,
        status,
        created_by
    } = taskData;

    const checkExistingAssignTaskByUser = await poolQuery(
        `select * from assigned_tasks where task_id = '${task_id}' and active = true and fk_assigned_to = '${fk_assigned_to}'`
    );

    if(checkExistingAssignTaskByUser.rowCount > 0){
        throw new Error(`${fk_assigned_to} was already assigned in this task`);
    }

    // SQL query to insert a new assigned task
    const query = `
        INSERT INTO assigned_tasks (
            fk_assigned_to,
            task_id,
            note,
            start_date_time,
            end_date_time,
            percentage,
            status,
            created_at,
            fk_created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING id, created_at;
    `;

    const values = [
        fk_assigned_to,
        task_id,
        note,
        start_date_time,
        end_date_time,
        percentage,
        status,
        created_by
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the newly created record's ID and created_at timestamp
};

const removeAssignedTask = async (
    assigned_task_id,
    task_id,
    remark
) => {
    const query = `
        UPDATE assigned_tasks
        SET 
            active = false,
            updated_at = NOW(),
            remark = $1
        WHERE id = $2
        RETURNING id, updated_at;
    `;

    const values = [
        remark, assigned_task_id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the updated task details
};


module.exports = { isExistTask, 
    isExistTaskById, 
    getTaskById, 
    getTaskByProjectId, 
    getAssignedTaskById, 
    createTask, 
    updateTaskStatus,
    createAssignedTask,
    removeAssignedTask };