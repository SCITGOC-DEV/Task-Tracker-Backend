const express = require("express");
const poolQuery = require("../../misc/poolQuery");

// Function to log the transaction
const logTransaction = async ({ transaction_type, action, remark, created_by, created_at }) => {
    const transactionQuery = `
        INSERT INTO transaction(transaction_type, action, remark, created_by, created_at)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id;
    `;

    const values = [transaction_type, action, remark, created_by, created_at];

    await poolQuery(transactionQuery, values);
};

module.exports = logTransaction;