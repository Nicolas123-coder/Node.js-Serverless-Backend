const { logger, jwt, response } = require("/opt/utils");
const authorizerHandler = require("./handlers/authorizerHandler");

// Teste remover depois

exports.handler = async (event) => {
  return await authorizerHandler(
    jwt,
    logger,
    response,
    process.env.TOKEN_SECRET,
    event
  );
};
