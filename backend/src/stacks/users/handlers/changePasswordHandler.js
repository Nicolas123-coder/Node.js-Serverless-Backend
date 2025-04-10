const changePasswordHandler = async (
  dynamoDB,
  password,
  logger,
  tableName,
  corsHeaders,
  body
) => {
  logger.info("CHANGE PASSWORD EVENT", { body });

  const { tenantId, userId, oldPassword, newPassword } = body;

  if (!tenantId || !userId || !oldPassword || !newPassword) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "tenantId, userId, oldPassword, and newPassword are required",
      }),
    };
  }

  const user = await dynamoDB.getItem(tableName, { Id: userId });

  if (!user) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: "User not found" }),
    };
  }

  const isOldPasswordValid = await password.comparePassword(
    oldPassword,
    user.Password
  );

  if (!isOldPasswordValid) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Old password is incorrect" }),
    };
  }

  const hashedNewPassword = await password.hashPassword(newPassword);

  await dynamoDB.updateItem(
    tableName,
    { Id: userId },
    "SET Password = :password",
    { ":password": hashedNewPassword }
  );

  logger.info("Password updated successfully", { userId });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Password updated successfully" }),
  };
};

module.exports = changePasswordHandler;
