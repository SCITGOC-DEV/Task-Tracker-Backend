const poolQuery = require("../../misc/poolQuery");
const { InventoryTransactionTypeEnum } = require("../utils/enums");

const createInventoryTransaction = async (inventory_id, qty, transaction_type, remark, created_by) => {

    const query = `
        INSERT INTO inventory_transactions (
            inventory_id,
            qty,
            transaction_type,
            remark,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at;
    `;

    const values = [inventory_id, qty, transaction_type, remark, created_by];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the newly created record's ID and created_at timestamp
};

const updateInventoryQty = async (inventory_id, qty, transaction_type) => {

    if (transaction_type == InventoryTransactionTypeEnum.ADD) {
        const query = `
        UPDATE inventories
        SET quantity = quantity + $1
        WHERE id = $2        
        RETURNING id, updated_at;
    `;
    } else {
        const query = `
        UPDATE inventories
        SET quantity = quantity - $1,
            unit_on_request = unit_on_request - $2
        WHERE id = $3
        RETURNING id, updated_at;
    `;
    }

    const values = [qty, qty, inventory_id];

    const result = await poolQuery(query, values);
    return result.rows[0]; // Return the newly created record's ID and created_at timestamp
};

module.exports = {
    createInventoryTransaction,
    updateInventoryQty
};