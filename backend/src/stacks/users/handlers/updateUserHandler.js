const updateUserHandler = async (
  dynamoDB,
  logger,
  response,
  tableName,
  body
) => {
  logger.info("EVENT", { body });

  const { tenantId, userId, role, profileImage, active } = body;

  if (!tenantId || !userId) {
    return response.badRequest("tenantId and userId are required");
  }

  try {
    const existingUser = await dynamoDB.getItem(tableName, { Id: userId });

    if (!existingUser) {
      logger.warn("User not found", { userId });
      return response.buildResponse(404, { error: "User not found" });
    }

    let updateExpression = "SET #role = :role";
    const expressionAttributeValues = { ":role": role };
    const expressionAttributeNames = { "#role": "Role" };

    if (profileImage !== undefined) {
      updateExpression += ", ProfileImage = :profileImage";
      expressionAttributeValues[":profileImage"] = profileImage;
    }

    if (active !== undefined) {
      updateExpression += ", Active = :active";
      expressionAttributeValues[":active"] = active;
    }

    const updatedUser = await dynamoDB.updateItem(
      tableName,
      { Id: userId },
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    );

    logger.info("User updated successfully", { userId });

    delete updatedUser.Password;

    return response.success({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Error updating user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = updateUserHandler;
