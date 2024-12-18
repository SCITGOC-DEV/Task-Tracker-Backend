const jwt = require("jsonwebtoken");
const { jwttokenkey } = require("../config");

const authFromToken = (req, res, next) => {
    let token = req.body.token || req.headers["x-access-token"];

    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === "Bearer") {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.json({ success: false, message: "A token is required for authorization" });
    }
    try {
        const decoded = jwt.verify(token, jwttokenkey);
        req.idFromToken = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
        req.roleFromToken = decoded["https://hasura.io/jwt/claims"]["x-hasura-default-role"];
        next();
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error });
    }
}

module.exports = authFromToken;