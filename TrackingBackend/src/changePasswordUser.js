const poolQuery = require("../misc/poolQuery.js");
const express = require("express");
const bcrypt = require("bcrypt");

const userChangePasswordRouter = express.Router();
const saltRound = 10;

userChangePasswordRouter.post("/", async(req,res) => {
    try {
        const {user_name,oldPassword, newPassword} = req.body.input;
        const token = await userChangePasswordHandler(user_name,oldPassword,newPassword);
        res.json({error:0, message : "User Change Password Successful!"});
    } catch (error) {
        res.json({error:1, message : error.message});
    }
})

const userChangePasswordHandler = async(user_name,oldPassword,newPassword) => {
    try {
        const result = await poolQuery(`select password from users where username = '${user_name}'`);
        if(result.rowCount === 0) {
            throw new Error("User is not register!");
        }
        const rightPassword = result.rows[0].password;
        const passwordStatus = await bcrypt.compare(oldPassword,rightPassword);
        if(passwordStatus == false) {
            throw new Error("Wrong Old Password!");
        }
        const hashedNewPassword = await bcrypt.hash(newPassword,saltRound);
        await poolQuery(`update users set password = '${hashedNewPassword}' where username = '${user_name}'`);
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = userChangePasswordRouter;