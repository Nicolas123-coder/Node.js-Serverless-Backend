const { logger, jwt, response, xray } = require("/opt/utils");
const authorizerHandler = require("./handlers/authorizerHandler");

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  logger.info("X-Ray Trace ID", { traceId });

  return await authorizerHandler(
    jwt,
    logger,
    response,
    process.env.TOKEN_SECRET,
    event
  );
};
