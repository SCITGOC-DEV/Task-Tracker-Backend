const jwt = require("jsonwebtoken");
const { jwttokenkey } = require("../config");

const authFromToken = (req, res, next) => {
    let token = req.body.token || req.headers["x-access-token"];

    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === "Bearer") {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.json({ success: false, message: "A token is required for authorization" });
    }
    try {
        const decoded = jwt.verify(token, jwttokenkey);
        req.idFromToken = decoded.hasura["x-hasura-user-id"];
        req.roleFromToken = decoded.hasura["x-hasura-default-role"];
        next();
    } catch (error) {
        console.log(err);
        res.json({ success: false, message: err });
    }
}

module.exports = authFromToken;