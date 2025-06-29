const { dynamoDB, xray } = require("/opt/aws");
const { logger, response } = require("/opt/utils");

const getTenants = require("./handlers/getHandler");

exports.handler = async () => {
  const traceId = xray.getTraceId();
  const tableName = process.env.TENANTS_TABLE;

  try {
    logger.info("X-Ray Trace ID", { traceId });

    return await getTenants(dynamoDB, logger, response, tableName);
  } catch (error) {
    logger.error("Unhandled error in getTenants", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
