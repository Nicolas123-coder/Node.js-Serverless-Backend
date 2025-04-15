const { dynamoDB } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const listUsersHandler = require("./handlers/getUsersHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const queryStringParameters = event.queryStringParameters || {};

    return await listUsersHandler(
      dynamoDB,
      logger,
      response,
      tableName,
      queryStringParameters
    );
  } catch (error) {
    logger.error("Error fetching users", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
