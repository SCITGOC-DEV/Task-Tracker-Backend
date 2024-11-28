// Enum for projects table status
const ProjectStatusEnum = Object.freeze({
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    PROGRESSING: 'Progressing',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
});

// Enum for assigned_projects table status
const AssignedProjectStatusEnum = Object.freeze({
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    PROGRESSING: 'Progressing',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
});

// Enum for tasks table status
const TaskStatusEnum = Object.freeze({
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    ACCEPTED: 'Accepted',
    PROGRESSING: 'Progressing',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
});

// Enum for assigned_tasks table status
const AssignedTaskStatusEnum = Object.freeze({
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    PROGRESSING: 'Progressing',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
});

// Enum for project_inventories table status
const ProjectInventoryStatusEnum = Object.freeze({
    NULL: null,  // Or 'NULL' string depending on your DB configuration
    USING: 'Using',
    RETURNED: 'Returned',
    NO_RETURN: 'No Return',
});

// Enum for task_inventories table status
const TaskInventoryStatusEnum = Object.freeze({
    NULL: null,  // Or 'NULL' string depending on your DB configuration
    USING: 'Using',
    RETURNED: 'Returned',
    NO_RETURN: 'No Return',
});

// Enum for log transaction table status
const TransactionTypeEnum = Object.freeze({
    INVENTORY: 'INVENTORY',
    PROJECT: 'PROJECT',
    TASK: 'TASK',
});

// Enum for log transaction table status
const TransactionStatusEnum = Object.freeze({
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    ASSIGNED: "ASSIGNED",
    ADD: "ADD",
    REMOVE : "REMOVE",
    CHANGE:'CHANGE'
});


// Export all the enums
module.exports = {
    ProjectStatusEnum,
    AssignedProjectStatusEnum,
    TaskStatusEnum,
    AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum,
    TaskInventoryStatusEnum,
    TransactionTypeEnum,
    TransactionStatusEnum
};
