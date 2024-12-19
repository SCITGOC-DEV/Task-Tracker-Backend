const express = require("express");
const poolQuery = require("../../misc/poolQuery");

const updateInventoryRouter = express.Router();

updateInventoryRouter.post("/", async (req, res) => {
    const {
        id, // Required field
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

    // Required fields check
    const requiredFields = [id, unit_price, quantity, serial_number_end, is_return];
    for (let field of requiredFields) {
        if (typeof field === "undefined") {
            res.json({ success: false, message: "id, unit_price, quantity, serial_number_end, is_return are required fields" });
            return;
        }
    }

    try {
        const result = await updateInventory({
            id, supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
            date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
            unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
            serial_number_end, is_return, type, inventory_category_id, part_number
        });
        res.json({ success: true, message: "Inventory updated successfully", inventoryId: result.inventoryId, scit_control_number: result.scit_control_number, updated_at: result.updated_at });
    } catch (error) {
        res.json({ success: false, message: `${error.message}` });
    }
});

const updateInventory = async (inventoryData) => {
    const {
        id, supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
        date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
        unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
        serial_number_end, is_return, type, inventory_category_id, part_number
    } = inventoryData;

    // SQL query to update the inventory data
    const query = `
        UPDATE inventories
        SET supplier = $1, country = $2, address = $3, contact_number = $4, email_address = $5, website = $6,
            unit_price = $7, quantity = $8, total_amount = $9, date_purchase_received = $10, date_release = $11,
            total_unit_release = $12, delivered_to_client = $13, delivery_receipt_no = $14, unit_return = $15,
            location_stock = $16, date_return = $17, stock_office = $18, total_stock_amount = $19,
            serial_number_start = $20, serial_number_end = $21, is_return = $22, type = $23,
            inventory_category_id = $24, part_number = $25, updated_at = NOW(), total_qty = $26
        WHERE id = $27
        RETURNING id as inventoryId, scit_control_number, updated_at;
    `;

    const values = [
        supplier, country, address, contact_number, email_address, website, unit_price, quantity, total_amount,
        date_purchase_received, date_release, total_unit_release, delivered_to_client, delivery_receipt_no,
        unit_return, location_stock, date_return, stock_office, total_stock_amount, serial_number_start,
        serial_number_end, is_return, type, inventory_category_id, part_number, quantity, id
    ];

    const result = await poolQuery(query, values);
    return result.rows[0];  // Return the updated inventory details
};

module.exports = updateInventoryRouter;
