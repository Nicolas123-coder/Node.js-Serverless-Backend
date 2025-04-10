const { dynamoDB } = require("/opt/aws");
const { logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const listUsersHandler = require("./handlers/getUsersHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const queryStringParameters = event.queryStringParameters || {};

    return await listUsersHandler(
      dynamoDB,
      logger,
      corsHeaders,
      tableName,
      queryStringParameters
    );
  } catch (error) {
    logger.error("Error fetching users", {
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
