const deleteUserHandler = async (
  dynamoDB,
  logger,
  corsHeaders,
  tableName,
  pathParameters
) => {
  logger.info("DELETE USER EVENT", { pathParameters });

  const { userId } = pathParameters || {};

  if (!userId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "userId is required" }),
    };
  }

  const existingUser = await dynamoDB.getItem(tableName, { Id: userId });

  if (!existingUser) {
    logger.warn("User not found", { userId });
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: "User not found" }),
    };
  }

  await dynamoDB.deleteItem(tableName, { Id: userId });

  logger.info("User deleted successfully", { userId });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: "User deleted successfully" }),
  };
};

module.exports = deleteUserHandler;
