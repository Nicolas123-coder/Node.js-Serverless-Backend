const { dynamoDB, xray } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const listUsersHandler = require("./handlers/getUsersHandler");

// REMOVER DEPOIS

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  try {
    const tableName = process.env.USERS_TABLE;
    const queryStringParameters = event.queryStringParameters || {};

    logger.info("X-Ray Trace ID", { traceId });

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
