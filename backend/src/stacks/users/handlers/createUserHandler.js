const createUserHandler = async (
  dynamoDB,
  uuid,
  password,
  logger,
  tableName,
  corsHeaders,
  body
) => {
  logger.info("EVENT", { body });

  const { username, email, tenantId, role, createdBy, profileImage, active } =
    body;

  if (!username || !email || !tenantId || !role || !createdBy) {
    logger.warn("Create user Attempt Failed - Missing Fields");
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  const existingUser = await dynamoDB.queryItems(
    tableName,
    "Username = :username",
    { ":username": username },
    "UsernameIndex"
  );

  if (existingUser.length > 0) {
    logger.warn("Create user Failed - User already exists");
    return {
      statusCode: 409,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "User with this username already exists",
      }),
    };
  }

  const rawPassword = password.generateRandomPassword();
  const hashedPassword = await password.hashPassword(rawPassword);

  const newUser = {
    TenantId: tenantId,
    Id: uuid.generateUuid(),
    Username: username,
    Email: email,
    Password: hashedPassword,
    Role: role,
    CreatedBy: createdBy,
    CreatedAt: new Date().toISOString(),
    ProfileImage: profileImage || null,
    Active: active !== undefined ? active : true,
  };

  await dynamoDB.putItem(tableName, newUser);

  logger.info("User created", { Id: newUser.Id });

  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({
      user: {
        ...newUser,
        Password: undefined, // nunca retornar senha no corpo
      },
      password: rawPassword, // senha original pra onboarding
    }),
  };
};

module.exports = createUserHandler;
