const { dynamoDB, xray } = require("/opt/aws");
const { password, logger, response } = require("/opt/utils");

const changePasswordHandler = require("./handlers/changePasswordHandler");

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  try {
    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    logger.info("X-Ray Trace ID", { traceId });

    return await changePasswordHandler(
      dynamoDB,
      password,
      logger,
      response,
      tableName,
      body
    );
  } catch (error) {
    logger.error("Error changing password:", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
