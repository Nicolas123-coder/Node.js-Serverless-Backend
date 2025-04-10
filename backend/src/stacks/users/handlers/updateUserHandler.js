const updateUserHandler = async (
  dynamoDB,
  logger,
  corsHeaders,
  tableName,
  body
) => {
  logger.info("UPDATE USER EVENT", { body });

  const { tenantId, userId, role, profileImage, active } = body;

  if (!tenantId || !userId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "tenantId and userId are required" }),
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

  let updateExpression = "SET #role = :role";
  let expressionAttributeValues = { ":role": role };
  let expressionAttributeNames = { "#role": "Role" };

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

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      message: "User updated successfully",
      user: updatedUser,
    }),
  };
};

module.exports = updateUserHandler;
