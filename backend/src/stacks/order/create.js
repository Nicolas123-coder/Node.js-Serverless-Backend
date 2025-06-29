const { sqs, xray } = require("/opt/aws");
const { uuid, logger, response } = require("/opt/utils");

const createOrderHandler = require("./handlers/createHandler");

exports.handler = async (event) => {
  const traceId = xray.getTraceId();

  try {
    logger.info("X-Ray Trace ID", { traceId });

    const queueUrl = process.env.ORDERS_QUEUE_URL;
    const body = JSON.parse(event.body);

    return await createOrderHandler(
      sqs,
      uuid,
      logger,
      response,
      queueUrl,
      body
    );
  } catch (error) {
    logger.error("Error creating order", {
      error: error.message,
      stack: error.stack,
      traceId,
    });

    return response.serverError("Internal Server Error");
  }
};
