const { dynamoDB, xray } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const updateTenant = require("./handlers/updateHandler");

exports.handler = async (event) => {
  try {
    const traceId = xray.getTraceId();
    const tableName = process.env.TENANTS_TABLE;
    const body = JSON.parse(event.body);

    logger.info("X-Ray Trace ID", { traceId });

    return await updateTenant(dynamoDB, logger, response, tableName, body);
  } catch (error) {
    logger.error("Error updating tenant", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
