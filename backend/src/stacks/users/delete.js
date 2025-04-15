const { dynamoDB } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const deleteUserHandler = require("./handlers/deleteUserHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const pathParameters = event.pathParameters || {};

    return await deleteUserHandler(
      dynamoDB,
      logger,
      response,
      tableName,
      pathParameters
    );
  } catch (error) {
    logger.error("Error deleting user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
