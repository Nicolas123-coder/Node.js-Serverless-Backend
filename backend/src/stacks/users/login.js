const { dynamoDB } = require("/opt/aws");
const { password, jwt, logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
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
      tableName,
      corsHeaders,
      body,
      tokenSecret
    );
  } catch (error) {
    logger.error("Login error", {
      error: error.message,
      stack: error.stack,
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
