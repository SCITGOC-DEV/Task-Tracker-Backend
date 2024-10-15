const express = require("express");
const poolQuery = require("../../misc/poolQuery");

// Function to log the transaction
const logTransaction = async (transaction_type, action, remark, created_by ) => {
    const transactionQuery = `
        INSERT INTO transactions(transaction_type, action, remark, created_by)
        VALUES($1, $2, $3, $4)
        RETURNING id;
    `;

    const values = [transaction_type, action, remark, created_by];

    await poolQuery(transactionQuery, values);
};

module.exports = logTransaction;