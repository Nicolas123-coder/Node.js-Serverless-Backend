const changePasswordHandler = async (
  dynamoDB,
  password,
  logger,
  response,
  tableName,
  body
) => {
  logger.info("EVENT", { body });

  const { tenantId, userId, oldPassword, newPassword } = body;

  if (!tenantId || !userId || !oldPassword || !newPassword) {
    return response.badRequest(
      "tenantId, userId, oldPassword, and newPassword are required"
    );
  }

  try {
    const user = await dynamoDB.getItem(tableName, { Id: userId });

    if (!user) {
      return response.buildResponse(404, { error: "User not found" });
    }

    const isOldPasswordValid = await password.comparePassword(
      oldPassword,
      user.Password
    );

    if (!isOldPasswordValid) {
      return response.buildResponse(403, {
        error: "Old password is incorrect",
      });
    }

    const hashedNewPassword = await password.hashPassword(newPassword);

    await dynamoDB.updateItem(
      tableName,
      { Id: userId },
      "SET Password = :password",
      { ":password": hashedNewPassword }
    );

    logger.info("Password updated successfully", { userId });

    return response.success({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Error changing password", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = changePasswordHandler;
