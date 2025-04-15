const listUsersHandler = async (
  dynamoDB,
  logger,
  response,
  tableName,
  queryStringParameters
) => {
  logger.info("EVENT", { queryStringParameters });

  const tenantId = queryStringParameters?.tenantId;

  if (!tenantId) {
    return response.badRequest("tenantId is required");
  }

  try {
    const users = await dynamoDB.queryItems(
      tableName,
      "TenantId = :tenantId",
      { ":tenantId": tenantId },
      "TenantIndex"
    );

    const sanitizedUsers = users.map(
      ({ Password, ...userWithoutPassword }) => userWithoutPassword
    );

    return response.success(sanitizedUsers);
  } catch (error) {
    logger.error("Error listing users", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = listUsersHandler;
