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
      message: "Admin Login Successful",
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
    await checkPassword(password, rightPassword);
    const userName = result.rows[0].username;

    const token = await jwtCreator(userId, userName, result.rows[0].role);

    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkPassword = async (password, hashedPassword) => {
  const passwordStatus = await bcrypt.compare(password, hashedPassword);
  console.log("passwordStatus");
  if (passwordStatus == false) {
    throw new Error("Wrong Password!");
  }
};

module.exports = adminLoginRouter;
