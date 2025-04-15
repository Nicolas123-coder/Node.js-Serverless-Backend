const createHandler = async (
  dynamoDB,
  uuid,
  logger,
  response,
  tableName,
  body
) => {
  const { name, modules } = body;

  if (!name || !modules || !Array.isArray(modules)) {
    logger.warn("Create tenant attempt failed - Missing or invalid fields");

    return response.badRequest("Missing or invalid required fields");
  }

  const newTenant = {
    TenantId: uuid.generateUuid(),
    Name: name,
    Modules: modules,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
    Active: true,
  };

  await dynamoDB.putItem(tableName, newTenant);

  logger.info("Tenant created successfully", { tenant: newTenant });

  return response.created({ tenant: newTenant });
};

module.exports = createHandler;
