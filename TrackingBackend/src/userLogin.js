const poolQuery = require("../misc/poolQuery.js");
const jwtCreator = require("./jwtCreator.js");
const express = require("express");
const bcrypt = require("bcrypt");

const userLoginRouter = express.Router();

userLoginRouter.post("/", async (req, res) => {
  try {
    const { username, password } = req.body.input;
    const token = await userLoginHandler(username, password);
    res.json({
      error: 0,
      message: "User Login Successful!",
      accessToken: token,
    });
  } catch (e) {
    res.json({ error: 1, message: e.message, accessToken: "" });
  }
});

const userLoginHandler = async (username, password) => {
  try {
    const result = await poolQuery(
      `select * from users where username = '${username}' `
    );

    if (result.rowCount === 0) {
      throw new Error("User is not registered or user is disabled");
    }
    const rightPassword = result.rows[0].password;
    const userId = result.rows[0].id;
    const userName = result.rows[0].username;

    const token = jwtCreator(userId, userName, "user");
    await checkPassword(password, rightPassword);
    return token;
  } catch (e) {
    throw new Error(e.message);
  }
};

const checkPassword = async (password, hashedPassword) => {
  const passwordStatus = await bcrypt.compare(password, hashedPassword);

  if (passwordStatus == false) {
    throw new Error("Wrong Password");
  }
};

module.exports = userLoginRouter;
