const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const createReturnInventoryProjectRouter = express.Router();

createReturnInventoryProjectRouter.post("/", async (req, res) => {
    const {
        project_inventory_id, // Required field
        total_qty, // Required field
        received_qty, // Required field
        return_qty, // Required field
        return_date, // Required field
        receive_admin_name, // Required field
        return_admin_name, // Required field
        remark, // Optional field
        description // Optional field
    } = req.body.input;

    // Required fields check
    const requiredFields = [project_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name];
    for (let field of requiredFields) {
        if (typeof field === "undefined") {
            res.json({ success: false, message: "All required fields must be provided." });
            return;
        }
    }

    try {
        const result = await createReturnInventoryProject({
            project_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
        });
        res.json({ success: true, message: "Return inventory project created successfully", id: result.id, created_at: result.created_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const createReturnInventoryProject = async (returnInventoryData) => {
    const {
        project_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
    } = returnInventoryData;

    // SQL query to insert a return inventory entry
    const query = `
        INSERT INTO return_inventory_projects (
            project_inventory_id,
            total_qty,
            received_qty,
            return_qty,
            return_date,
            receive_admin_name,
            return_admin_name,
            remark,
            description,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, created_at;
    `;

    const values = [
        project_inventory_id, total_qty, received_qty, return_qty, return_date, receive_admin_name, return_admin_name, remark, description
    ];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the inserted record's ID and created_at timestamp
};

module.exports = createReturnInventoryProjectRouter;
