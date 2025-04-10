const { logger, jwt } = require("/opt/utils");
const authorizerHandler = require("./handlers/authorizerHandler");

exports.handler = async (event) => {
  return await authorizerHandler(jwt, logger, process.env.TOKEN_SECRET, event);
};
