const jwt = require("jsonwebtoken");
const { jwttokenkey, jwtExpTime } = require("../config");

const jwtCreator = async (id, userName, role) => {
  const hasura = {};
  hasura["all_roles"] = [role];
  hasura["x-hasura-default-role"] = role;
  hasura["x-hasura-allowed-roles"] = [role];
  hasura["x-hasura-user-id"] = `${userName}`;

  const token = jwt.sign({ id, userName, hasura }, jwttokenkey, { expiresIn: jwtExpTime });
  return token;
};

module.exports = jwtCreator;
