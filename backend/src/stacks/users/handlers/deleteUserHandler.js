const deleteUserHandler = async (
  dynamoDB,
  logger,
  response,
  tableName,
  pathParameters
) => {
  logger.info("EVENT", { pathParameters });

  const { userId } = pathParameters || {};

  if (!userId) {
    return response.badRequest("userId is required");
  }

  try {
    const existingUser = await dynamoDB.getItem(tableName, { Id: userId });

    if (!existingUser) {
      logger.warn("User not found", { userId });
      return response.buildResponse(404, { error: "User not found" });
    }

    await dynamoDB.deleteItem(tableName, { Id: userId });

    logger.info("User deleted successfully", { userId });

    return response.success({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = deleteUserHandler;
