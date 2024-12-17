const poolQuery = require("../../misc/poolQuery");
const express = require("express");
const bcrypt = require("bcrypt");

const projectAdminResetPasswordRouter = express.Router();
const saltRound = 10;

projectAdminResetPasswordRouter.post("/", async (req, res) => {
  try {
    const { user_name, new_password } = req.body.input;
    await adminResetPassword(user_name, new_password);
    res.json({ success: true, message: "Admin Reset Password Successful!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

const adminResetPassword = async (
  user_name,
  new_password
) => {
  try {
    const result = await poolQuery(
      `select password from admin where username = '${user_name}'`
    );
    if (result.rowCount === 0) {
      throw new Error("User is not register!");
    }

    const hashedNewPassword = await bcrypt.hash(new_password, saltRound);
    await poolQuery(
      `update admin set password = '${hashedNewPassword}', is_reset_password = '${hashedNewPassword}'  where username = '${user_name}'`
    );

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = projectAdminResetPasswordRouter;
