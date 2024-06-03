const poolQuery = require("../misc/poolQuery.js");
const { genSaltSync, hash } = require("bcrypt");
const jwtCreator = require("./jwtCreator.js");
const express = require("express");
const userRegisterRouter = express.Router();

userRegisterRouter.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body.input;
    await checkUserExist(email);

    const hashedPassword = await hash(password, genSaltSync(10));
    const result = await poolQuery(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username`,
      [username, email, hashedPassword]
    );
    const userName = result.rows[0].username;
    const userId = result.rows[0].id;
    const token = await jwtCreator(userId, userName, "user");
    res.json({
      error: 0,
      message: "User Register Successful",
      accessToken: token,
    });
  } catch (error) {
    res.json({ error: 1, message: e.message, accessToken: "" });
  }
});

const checkUserExist = async (email) => {
  try {
    const result = await poolQuery(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (result.rowCount !== 0) {
      res.json({
        error: 1,
        message: `User already exist with email: ${email}`,
      });
    }
  } catch (error) {
    res.json({ error: 1, message: error.message });
  }
};

module.exports = userRegisterRouter;
