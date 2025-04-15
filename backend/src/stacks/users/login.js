const { dynamoDB } = require("/opt/aws");
const { password, jwt, logger, response } = require("/opt/utils");

const loginHandler = require("./handlers/loginHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const tokenSecret = process.env.TOKEN_SECRET;
    const body = JSON.parse(event.body);

    return await loginHandler(
      dynamoDB,
      password,
      jwt,
      logger,
      response,
      tableName,
      body,
      tokenSecret
    );
  } catch (error) {
    logger.error("Login error", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
