const createUserHandler = async (
  dynamoDB,
  uuid,
  password,
  logger,
  response,
  tableName,
  body
) => {
  logger.info("EVENT", { body });

  const { username, email, tenantId, role, createdBy, profileImage, active } =
    body;

  if (!username || !email || !tenantId || !role || !createdBy) {
    logger.warn("Create user failed - Missing fields");
    return response.badRequest("Missing required fields");
  }

  try {
    const existingUser = await dynamoDB.queryItems(
      tableName,
      "Username = :username",
      { ":username": username },
      "UsernameIndex"
    );

    if (existingUser.length > 0) {
      logger.warn("Create user failed - User already exists");
      return response.buildResponse(409, {
        error: "User with this username already exists",
      });
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

    return response.created({
      user: {
        ...newUser,
        Password: undefined,
      },
      password: rawPassword,
    });
  } catch (error) {
    logger.error("Error creating user", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = createUserHandler;
