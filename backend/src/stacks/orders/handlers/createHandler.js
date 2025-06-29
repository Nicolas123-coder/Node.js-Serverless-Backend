const createOrderHandler = async (
  sqs,
  uuid,
  logger,
  response,
  queueUrl,
  body
) => {
  logger.info("EVENT", { body });

  const { customerId, items, totalAmount, createdBy } = body;

  if (!customerId || !items || !totalAmount || !createdBy) {
    logger.warn("Create order failed - Missing fields");
    return response.badRequest("Missing required fields");
  }

  try {
    const order = {
      OrderId: uuid.generateUuid(),
      CustomerId: customerId,
      Items: items,
      TotalAmount: totalAmount,
      CreatedBy: createdBy,
      CreatedAt: new Date().toISOString(),
      Status: "PENDING",
    };

    await sqs.sendMessage(queueUrl, order);

    logger.info("Order sent to SQS", { OrderId: order.OrderId });

    return response.created({
      message: "Order successfully queued",
      orderId: order.OrderId,
    });
  } catch (error) {
    logger.error("Error sending order to SQS", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = createOrderHandler;
