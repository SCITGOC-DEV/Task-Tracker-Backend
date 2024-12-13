const poolQuery = require("../misc/poolQuery.js");
const express = require("express");
const bcrypt = require("bcrypt");

const userResetPasswordRouter = express.Router();
const saltRound = 10;

userResetPasswordRouter.post("/", async (req, res) => {
  try {
    const { user_name, new_password } = req.body.input;
    await userResetPassword(user_name, new_password);
    res.json({ error: 0, message: "User Reset Password Successful!" });
  } catch (error) {
    res.json({ error: 1, message: error.message });
  }
});

const userResetPassword = async (
  user_name,
  new_password
) => {
  try {
    const result = await poolQuery(
      `select password from users where username = '${user_name}'`
    );
    if (result.rowCount === 0) {
      throw new Error("User is not register!");
    }

    const hashedNewPassword = await bcrypt.hash(new_password, saltRound);
    await poolQuery(
      `update users set password = '${hashedNewPassword}', is_reset_password = '${hashedNewPassword}' where username = '${user_name}'`
    );

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = userResetPasswordRouter;
