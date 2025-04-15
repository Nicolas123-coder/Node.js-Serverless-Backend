const { dynamoDB } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const updateUserHandler = require("./handlers/updateUserHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    return await updateUserHandler(dynamoDB, logger, response, tableName, body);
  } catch (error) {
    logger.error("Error updating user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
