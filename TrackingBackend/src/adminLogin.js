const poolQuery = require("../misc/poolQuery.js");
const jwtCreator = require("./jwtCreator.js");
const express = require("express");
const bcrypt = require("bcrypt");

const adminLoginRouter = express.Router();

adminLoginRouter.post("/", async (req, res) => {
  try {
    const { admin_name, password } = req.body.input;
    const token = await adminLogInHandler(admin_name, password);
    res.json({
      error: 0,
      message: "Admin Login Successfully",
      accessToken: token,
    });
  } catch (e) {
    res.json({ error: 1, message: e.message, accessToken: "" });
  }
});

const adminLogInHandler = async (admin_name, password) => {
  try {
    const result = await poolQuery(
      `select * from admin where username = '${admin_name}'`
    );
    console.log(result.rowCount);
    if (result.rowCount === 0) {
      throw new Error("Admin is not registered or admin does not have!");
    }

    const rightPassword = result.rows[0].password;
    const userId = result.rows[0].id;
    const isResetPassword = result.rows[0].is_reset_password;
    const passwordStatus = await bcrypt.compare(password, rightPassword);

    if (passwordStatus == false && isResetPassword != null) {
      throw new Error("Your password has been reset! Please contact the site administrator.");
    } else if (passwordStatus == false) {
      throw new Error("Wrong Password!");
    }

    const userName = result.rows[0].username;
    
    if(isResetPassword != null){
      await poolQuery(
        `update admin set is_reset_password = NULL where username = '${userName}'`
      );
    }

    const token = await jwtCreator(userId, userName, result.rows[0].role);

    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = adminLoginRouter;
