const { dynamoDB, xray } = require("/opt/aws");
const { uuid, logger, response } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const createTenant = require("./handlers/createHandler");

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  try {
    const body = JSON.parse(event.body);
    const tableName = process.env.TENANTS_TABLE;

    logger.info("X-Ray Trace ID", { traceId });

    return await createTenant(
      dynamoDB,
      uuid,
      logger,
      response,
      corsHeaders,
      tableName,
      body
    );
  } catch (error) {
    logger.error("Error creating tenant", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
