const listUsersHandler = async (
  dynamoDB,
  logger,
  corsHeaders,
  tableName,
  queryStringParameters
) => {
  logger.info("LIST USERS EVENT", { queryStringParameters });

  const tenantId = queryStringParameters?.tenantId;

  if (!tenantId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "tenantId is required" }),
    };
  }

  const users = await dynamoDB.queryItems(
    tableName,
    "TenantId = :tenantId",
    { ":tenantId": tenantId },
    "TenantIndex"
  );

  const sanitizedUsers = users.map(
    ({ Password, ...userWithoutPassword }) => userWithoutPassword
  );

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(sanitizedUsers),
  };
};

module.exports = listUsersHandler;
