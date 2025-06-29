const { dynamoDB, xray } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const updateUserHandler = require("./handlers/updateUserHandler");

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  try {
    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    logger.info("X-Ray Trace ID", { traceId });

    return await updateUserHandler(dynamoDB, logger, response, tableName, body);
  } catch (error) {
    logger.error("Error updating user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
