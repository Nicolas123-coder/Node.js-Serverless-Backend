const loginHandler = async (
  dynamoDB,
  password,
  jwt,
  logger,
  response,
  tableName,
  body,
  tokenSecret
) => {
  logger.info("EVENT", { body });

  const { username, password: userPassword } = body;

  if (!username || !userPassword) {
    logger.warn("Login Attempt Failed - Missing Fields");
    return response.badRequest("Username and password are required");
  }

  try {
    const users = await dynamoDB.queryItems(
      tableName,
      "Username = :username",
      { ":username": username },
      "UsernameIndex"
    );

    const user = users[0];

    const failResponse = () =>
      response.buildResponse(401, {
        error: "Invalid username or password",
      });

    if (!user) {
      logger.warn("Login Failed - User Not Found", { username });
      return failResponse();
    }

    const passwordMatch = await password.comparePassword(
      userPassword,
      user.Password
    );

    if (!passwordMatch) {
      logger.warn("Login Failed - Incorrect Password", { username });
      return failResponse();
    }

    const token = jwt.generateToken(
      {
        userId: user.Id,
        tenantId: user.TenantId,
        role: user.Role,
      },
      tokenSecret,
      "3h"
    );

    logger.info("Login successful", { userId: user.Id });

    return response.success({
      token,
      tenantId: user.TenantId,
      profileImage: user.ProfileImage,
      id: user.Id,
      role: user.Role,
    });
  } catch (error) {
    logger.error("Error during login", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = loginHandler;
