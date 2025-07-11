const { dynamoDB, xray } = require("/opt/aws");
const { uuid, password, logger, response } = require("/opt/utils");

const createUserHandler = require("./handlers/createUserHandler");

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  try {
    logger.info("X-Ray Trace ID", { traceId });

    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    return await createUserHandler(
      dynamoDB,
      uuid,
      password,
      logger,
      response,
      tableName,
      body
    );
  } catch (error) {
    logger.error("Error creating user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
