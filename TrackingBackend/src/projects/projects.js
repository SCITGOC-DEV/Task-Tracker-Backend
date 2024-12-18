const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
    TaskStatusEnum, AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
    TransactionTypeEnum, TransactionStatusEnum, InventoryTransactionTypeEnum } = require("../../src/utils/enums")

const createProject = async (projectData) => {
    const { project_name, project_description, start_date, end_date, status, percentage, created_by } = projectData;

    // SQL query to insert the project data
    const query = `
            INSERT INTO projects (project_name, project_description, start_date, end_date, status, percentage, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, created_at;
        `;

    const values = [project_name, project_description, start_date, end_date, status, percentage, created_by];

    const result = await poolQuery(query, values);
    return result.rows[0];  // Return the inserted project details
};

const updateProject = async (projectData) => {
    const {
        id, project_name, project_description, start_date, end_date, status,
        actual_start_date, actual_end_date, percentage
    } = projectData;

    // SQL query to update the project data
    const query = `
        UPDATE projects 
        SET project_name = $1,
            project_description = $2,
            start_date = $3,
            end_date = $4,
            status = $5,
            actual_start_date = $6,
            actual_end_date = $7,
            percentage = $8,
            updated_at = NOW()
        WHERE id = $9
        RETURNING   id, updated_at;
    `;

    const values = [
        project_name, project_description, start_date, end_date, status,
        actual_start_date, actual_end_date, percentage, id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0];  // Return the updated project details
};

const addAssignedProject = async (assignedProjectData) => {
    try {
        const {
            project_id, assigned_to, start_date, end_date, status, percentage, remark, created_by
        } = assignedProjectData;

        // SQL query to insert a new assigned project
        const query = `
            INSERT INTO assigned_projects (
                project_id, assigned_to, start_date, end_date, status, percentage, remark, created_by, active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, created_at;
        `;

        const values = [
            project_id, assigned_to, start_date, end_date, status, percentage, remark, created_by, true
        ];

        const result = await poolQuery(query, values);
        return result.rows[0]; // Return the inserted record details (id and created_at)
    } catch (error) {
        throw error;
    }
};

const isExistProject = async (project_name) => {
    // SQL query to select only the project_name column
    const query = `SELECT project_name FROM projects WHERE project_name = $1`; // Use parameterized query

    const result = await poolQuery(query, [project_name]);
    return result.rowCount > 0; // Return true if the project exists, false otherwise
};

const isExistProjectById = async (id, project_name) => {
    // SQL query to select only the project_name column
    const query = `SELECT project_name FROM projects WHERE id <> $1 and project_name = $2`; // Use parameterized query

    const result = await poolQuery(query, [id, project_name]);
    return result.rowCount > 0; // Return true if the project exists, false otherwise
};

const getProjectById = async (id) => {
    // SQL query to select only the project_name column
    const query = `SELECT * FROM projects WHERE id = $1`; // Use parameterized query

    const result = await poolQuery(query, [id]);
    return result.rowCount > 0 ? result.rows[0] : null; // Return true if the project exists, false otherwise
};

async function assignedInventoryToProject(project_id, inventory_id, total_qty, created_by) {
    try {
        const project = await poolQuery(
            `select * from projects where id = '${project_id}'`
        );

        if (project.rowCount === 0) {
            throw new Error("No project found!");
        }

        const inventories = await poolQuery(
            `select * from inventories where id = '${inventory_id}'`
        );

        if (inventories.rowCount === 0) {
            throw new Error("No inventory found!");
        }

        var qty = inventories.rows[0].quantity;
        var units_on_request = inventories.rows[0].units_on_request;
        var total_request = units_on_request + total_qty;
        var is_return = inventories.rows[0].is_return;
        let status;
        if (!is_return)
            status = ProjectInventoryStatusEnum.NO_RETURN
        else
            status = ProjectInventoryStatusEnum.NULL

        if (total_request > qty) {
            throw new Error("Inventory's quantity is not enough!");
        }

        var getExistingPI = await poolQuery(`
            SELECT * 
            FROM project_inventories
            WHERE project_id = $1 and inventory_id = $2
          `, [project_id, inventory_id]);

        if (getExistingPI.rowCount == 0) {
            var create_pj_inv_res = await poolQuery(`
                insert into project_inventories(project_id, inventory_id, total_qty, used_qty, status, is_return, created_by)
                values($1, $2, $3, $4, $5, $6, $7)
              `, [project_id, inventory_id, total_qty, 0, status, is_return, created_by]);

        } else {
            var update_pj_inv_res = await poolQuery(`
                UPDATE project_inventories
                SET total_qty = total_qty + $1
                WHERE id  = $2
              `, [total_qty, getExistingPI.id]);
        }

        await poolQuery(`update inventories set units_on_request = ${total_request} where id = ${inventory_id}`);

        return { scit_control_number: inventories.scit_control_number, project_name: project.project_name };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function createProjectInventoryTransaction(project_id, inventory_id, total_qty, created_by, requested_at, transaction_type, description) {
    try {
        const project = await poolQuery(
            `select * from projects where id = '${project_id}'`
        );

        if (project.rowCount === 0) {
            throw new Error("No project found!");
        }

        const inventories = await poolQuery(
            `select * from inventories where id = '${inventory_id}'`
        );

        if (inventories.rowCount === 0) {
            throw new Error("No inventory found!");
        }

        var is_return_inventory = inventories.rows[0].is_return;

        var pj_inv_res = await poolQuery(`
              insert into project_inventory_transactions(project_id, inventory_id, qty, request_admin, requested_at, transaction_type, description, is_return_inventory)
              values($1, $2, $3, $4, $5, $6, $7, $8)          
              RETURNING id, created_at;
            `, [project_id, inventory_id, total_qty, created_by, requested_at, transaction_type, description, is_return_inventory]);
        return {
            scit_control_number: inventories.rows[0].scit_control_number,
            project_name: project.rows[0].project_name,
            transaction_type: transaction_type,
            id: pj_inv_res.rows[0].id,
            created_at: pj_inv_res.rows[0].created_at
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function acceptAssignedInventoryToProject(project_inventory_transaction_id, approved_qty, approved_admin, is_approved, remark) {
    try {

        const project_inventory_transaction = await poolQuery(
            `select * from project_inventory_transactions where id = '${project_inventory_transaction_id}'`
        );

        if (project_inventory_transaction.rowCount === 0) {
            throw new Error("No project inventory transaction found!");
        }

        if (project_inventory_transaction.rows[0].is_approved) {
            throw new Error("Inventory was already approved.");
        }

        if (project_inventory_transaction.rows[0].transaction_type != InventoryTransactionTypeEnum.REQUEST) {
            throw new Error("Wrong transaction type.");
        }

        const project = await poolQuery(
            `select * from projects where id = '${project_inventory_transaction.rows[0].project_id}'`
        );

        if (project.rowCount === 0) {
            throw new Error("No project found!");
        }

        const inventories = await poolQuery(
            `select * from inventories where id = '${project_inventory_transaction.rows[0].inventory_id}'`
        );

        if (inventories.rowCount === 0) {
            throw new Error("No inventory found!");
        }

        var qty = inventories.rows[0].quantity;
        var units_on_request = inventories.rows[0].units_on_request;
        var total_request = units_on_request + approved_qty;

        if (total_request > qty) {
            throw new Error("Inventory's quantity is not enough!");
        }

        const date = new Date();
        var pj_inv_res = await poolQuery(`
              UPDATE project_inventory_transactions
              SET  approved_qty = $1,
                   approved_admin = $2, 
                   is_approved = $3, 
                   remark = $4,
                   approved_at = $5,
                   updated_at = $6
              WHERE id = $7
            `, [approved_qty, approved_admin, is_approved, remark, date, date, project_inventory_transaction_id]);

        if (approved_qty > 0) {
            var getExistingPI = await poolQuery(`
                SELECT * 
                FROM project_inventories
                WHERE project_id = $1 and inventory_id = $2
              `, [project_inventory_transaction.rows[0].project_id, project_inventory_transaction.rows[0].inventory_id]);

            if (getExistingPI.rowCount == 0) {
                const status = inventories.rows[0].is_return ? ProjectInventoryStatusEnum.RETURN : ProjectInventoryStatusEnum.NO_RETURN;
                var create_pj_inv_res = await poolQuery(`
                    insert into project_inventories(project_id, inventory_id, total_qty, used_qty, status, is_return, created_by)
                    values($1, $2, $3, $4, $5, $6, $7)      
                    RETURNING id, created_at;
                    `, [project_inventory_transaction.rows[0].project_id, project_inventory_transaction.rows[0].inventory_id, approved_qty, 0, status, inventories.rows[0].is_return, approved_admin]);

            } else {
                var update_pj_inv_res = await poolQuery(`
                    UPDATE project_inventories
                    SET total_qty = total_qty + $1
                    WHERE id  = $2
                  `, [approved_qty, getExistingPI.rows[0].id]);
            }

            await poolQuery(`update inventories set units_on_request = ${total_request} where id = ${project_inventory_transaction.rows[0].inventory_id}`);
        }

        return {
            scit_control_number: inventories.rows[0].scit_control_number,
            project_name: project.rows[0].project_name,
            transaction_type: project_inventory_transaction.rows[0].transaction_type,
            project_id: project_inventory_transaction.rows[0].project_id,
            inventory_id: project_inventory_transaction.rows[0].inventory_id
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getAssignedProjectById(project_id) {
    try {
        const result = await poolQuery(
            `select * from assigned_projects where id = ${project_id} and active = true`
        );
        if (result.rowCount === 0) {
            throw new Error("Assigned project doesn't exist in system!");
        }

        // Map result rows to a structured object
        const assignedProject = {
            id: result.rows[0].id,
            project_id: result.rows[0].project_id,
            assigned_to: result.rows[0].assigned_to,
            start_date: result.rows[0].start_date,
            end_date: result.rows[0].end_date,
            actual_start_date: result.rows[0].actual_start_date,
            actual_end_date: result.rows[0].actual_end_date,
            status: result.rows[0].status,
            created_at: result.rows[0].created_at,
            updated_at: result.rows[0].updated_at,
            percentage: result.rows[0].percentage,
            remark: result.rows[0].remark,
            active: result.rows[0].active,
            created_by: result.rows[0].created_by
        };

        return assignedProject;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function changeProjectStatus(old_name, new_name, project_id) {
    try {
        const result = await poolQuery(
            `select * from assigned_projects where id = '${project_id}' and assigned_admin_name = '${old_name}' and active = true`
        );
        if (result.rowCount === 0) {
            throw new Error("Assigned project doesn't exist in system!");
        }

        await poolQuery(`
              UPDATE assigned_projects
              SET  active = false
              WHERE project_id = $1 and assigned_admin_name = $2
            `, [project_id, old_name]);

    } catch (error) {
        throw new Error(error.message);
    }
}

async function updateMainProject(project_id) {
    try {
        const result = await poolQuery(
            `select * from assigned_projects where id = '${project_id}' and active = true`
        );
        if (result.rowCount === 0) {
            throw new Error("Assigned project doesn't exist in system!");
        }

        await poolQuery(`
              UPDATE assigned_projects
              SET  active = false
              WHERE project_id = $1 and assigned_admin_name = $2
            `, [project_id, old_name]);

    } catch (error) {
        throw new Error(error.message);
    }
}

async function changeAssignedProjectStatus(status, acual_start_date, acual_end_date, project_id) {
    try {
        const result = await poolQuery(
            `select * from assigned_projects where id = '${project_id}'`
        );
        if (result.rowCount === 0) {
            throw new Error("Assigned project doesn't exist in system!");
        }

        await poolQuery(`
              UPDATE assigned_projects
              SET status = $1, actual_start_date = $2, actual_end_date = $3
              WHERE project_id = $4
            `, [status, acual_start_date, acual_end_date, project_id]);
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    addAssignedProject,
    isExistProject,
    createProject,
    updateProject,
    isExistProjectById,
    getProjectById,
    assignedInventoryToProject,
    changeProjectStatus,
    getAssignedProjectById,
    changeAssignedProjectStatus,
    updateMainProject,
    createProjectInventoryTransaction,
    acceptAssignedInventoryToProject
};