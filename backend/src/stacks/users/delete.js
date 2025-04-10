const { dynamoDB } = require("/opt/aws");
const { logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const deleteUserHandler = require("./handlers/deleteUserHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const pathParameters = event.pathParameters || {};

    return await deleteUserHandler(
      dynamoDB,
      logger,
      corsHeaders,
      tableName,
      pathParameters
    );
  } catch (error) {
    logger.error("Error deleting user", {
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
