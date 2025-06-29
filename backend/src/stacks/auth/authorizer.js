const { logger, jwt, response } = require("/opt/utils");
const { xray } = require("/opt/aws");

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
