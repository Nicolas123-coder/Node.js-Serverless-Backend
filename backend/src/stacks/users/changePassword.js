const { dynamoDB } = require("/opt/aws");
const { password, logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const changePasswordHandler = require("./handlers/changePasswordHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    return await changePasswordHandler(
      dynamoDB,
      password,
      logger,
      tableName,
      corsHeaders,
      body
    );
  } catch (error) {
    logger.error("Error changing password:", {
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
