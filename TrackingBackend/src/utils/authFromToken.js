const jwt = require("jsonwebtoken");
const {jwttokenkey} = require("../../config");

const authFromToken = (req,res,next) => {
    let token = req.body.token || req.headers["x-access-token"];

    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === "Bearer") {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return res.status(403).send("A token is required for authorization");
    }
    try {
        const decoded = jwt.verify(token,jwttokenkey);
        req.idFromToken = decoded.hasura["x-hasura-user-id"];
        req.roleFromToken = decoded.hasura["x-hasura-default-role"];
        next();
    } catch (error) {
        res.status(500).json({error});
    }
}

module.exports = authFromToken;