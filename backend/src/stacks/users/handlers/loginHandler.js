const loginHandler = async (
  dynamoDB,
  password,
  jwt,
  logger,
  tableName,
  corsHeaders,
  body,
  tokenSecret
) => {
  logger.info("LOGIN EVENT", { body });

  const { username, password: userPassword } = body;

  if (!username || !userPassword) {
    logger.warn("Login Attempt Failed - Missing Fields");
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Username and password are required" }),
    };
  }

  const users = await dynamoDB.queryItems(
    tableName,
    "Username = :username",
    { ":username": username },
    "UsernameIndex"
  );

  const user = users[0];

  if (!user) {
    logger.warn("Login Failed - User Not Found", { username });
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid username or password" }),
    };
  }

  const passwordMatch = await password.comparePassword(
    userPassword,
    user.Password
  );

  if (!passwordMatch) {
    logger.warn("Login Failed - Incorrect Password", { username });
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid username or password" }),
    };
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

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      token,
      tenantId: user.TenantId,
      profileImage: user.ProfileImage,
      id: user.Id,
      role: user.Role,
    }),
  };
};

module.exports = loginHandler;
