const express = require("express");
const poolQuery = require("../../misc/poolQuery");
const logTransaction = require("../transactions/logTransaction")

const { ProjectStatusEnum, AssignedProjectStatusEnum,
    TaskStatusEnum, AssignedTaskStatusEnum,
    ProjectInventoryStatusEnum, TaskInventoryStatusEnum,
    TransactionTypeEnum, TransactionStatusEnum, 
    InventoryTransactionTypeEnum} = require("../../src/utils/enums");
const { createInventoryTransaction } = require("./inventories");

const createInventoryRouter = express.Router();

createInventoryRouter.post("/", async (req, res) => {
    try {
        const {
            supplier,
            country,
            address,
            contact_number,
            email_address,
            website,
            unit_price,
            quantity,
            total_amount,
            date_purchase_received,
            date_release,
            total_unit_release,
            delivered_to_client,
            delivery_receipt_no,
            unit_return,
            location_stock,
            date_return,
            stock_office,
            total_stock_amount,
            serial_number_start,
            serial_number_end,
            is_return,
            type,
            inventory_category_id,
            part_number
        } = req.body.input;

        let created_by = req.idFromToken;

        // Required fields check
        const requiredFields = [unit_price, quantity, serial_number_start, is_return, inventory_category_id];
        for (let field of requiredFields) {
            if (typeof field === "undefined") {
                res.json({ success: false, message: "unit_price, quantity, serial_number_start, is_return, inventory_category_id are required fields" });
                return;
            }
        }

        const scitControlNumber = await getNextScitControlNumber(); // Fetch next scit_control_number      

        const result = await createInventory({
            supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
            date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
            unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
            serial_number_end, is_return, type, inventory_category_id, part_number, scitControlNumber, created_by
        });

        await createInventoryTransaction(result.id, quantity, InventoryTransactionTypeEnum.ADD);

        await logTransaction(TransactionTypeEnum.INVENTORY, TransactionStatusEnum.CREATE, `Create inventory - SCIT Control Number: ${scitControlNumber}`, created_by);

        res.json({ success: true, message: "Inventory created successfully", inventoryId: result.id, scit_control_number: scitControlNumber, created_at: result.created_at });
    } catch (error) {

        res.json({ success: false, message: `${error.message}` });
    }
});

// Function to get the next SCIT control number
const getNextScitControlNumber = async () => {
    const sequenceQuery = `
        UPDATE sequences
        SET number = number + 1
        WHERE table_name = 'inventories' and name = 'scit_control_number'
        RETURNING number;
    `;

    const result = await poolQuery(sequenceQuery);
    const newSequence = result.rows[0].number;

    // Format the SCIT control number
    const scitControlNumber = `SCIT${String(newSequence).padStart(5, '0')}`;
    return scitControlNumber;
};

const createInventory = async (inventoryData) => {
    const {
        supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
        date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
        unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
        serial_number_end, is_return, type, inventory_category_id, part_number, scitControlNumber, created_by
    } = inventoryData;

    // SQL query to insert the inventory data
    const query = `
    INSERT INTO inventories(supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
                          date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
                          unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
                          serial_number_end, is_return, type, inventory_category_id, part_number, scit_control_number, admin_name, total_qty)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
    RETURNING id, scit_control_number, created_at;
`;

    const values = [
        supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
        date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
        unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
        serial_number_end, is_return, type, inventory_category_id, part_number, scitControlNumber, created_by, quantity
    ];

    const result = await poolQuery(query, values);

    return result.rows[0];  // Return the inserted inventory details
};

module.exports = createInventoryRouter;
