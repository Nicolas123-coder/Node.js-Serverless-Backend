const createHandler = async (
  dynamoDB,
  uuid,
  logger,
  corsHeaders,
  tableName,
  body
) => {
  const { name, modules } = body;

  if (!name || !modules || !Array.isArray(modules)) {
    logger.warn("Create tenant attempt failed - Missing or invalid fields");
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing or invalid required fields" }),
    };
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

  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ tenant: newTenant }),
  };
};

module.exports = createHandler;
