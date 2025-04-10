const { dynamoDB } = require("/opt/aws");
const { logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const updateUserHandler = require("./handlers/updateUserHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    return await updateUserHandler(
      dynamoDB,
      logger,
      corsHeaders,
      tableName,
      body
    );
  } catch (error) {
    logger.error("Error updating user", {
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
