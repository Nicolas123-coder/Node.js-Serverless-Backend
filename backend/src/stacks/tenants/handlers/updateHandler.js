const updateHandler = async (
  dynamoDB,
  logger,
  corsHeaders,
  tableName,
  body
) => {
  logger.info("UPDATE TENANT EVENT", { event: body });

  const { tenantId, name, modules, active } = body;

  if (!tenantId) {
    logger.warn("Update tenant failed - Missing tenantId");

    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing tenantId" }),
    };
  }

  if (modules && !Array.isArray(modules)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Modules must be an array" }),
    };
  }

  const updateExpressionParts = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  if (name) {
    updateExpressionParts.push("#N = :n");
    expressionAttributeNames["#N"] = "Name";
    expressionAttributeValues[":n"] = name;
  }

  if (modules) {
    updateExpressionParts.push("#M = :m");
    expressionAttributeNames["#M"] = "Modules";
    expressionAttributeValues[":m"] = modules;
  }

  if (typeof active === "boolean") {
    updateExpressionParts.push("#A = :a");
    expressionAttributeNames["#A"] = "Active";
    expressionAttributeValues[":a"] = active;
  }

  updateExpressionParts.push("#U = :u");
  expressionAttributeNames["#U"] = "UpdatedAt";
  expressionAttributeValues["u"] = new Date().toISOString();

  const updateExpression = "SET " + updateExpressionParts.join(", ");

  await dynamoDB.updateTenantBruteForce({
    tableName,
    key: { TenantId: tenantId },
    updateExpression,
    attributeNames: expressionAttributeNames,
    attributeValues: {
      name,
      modules,
      active,
      updatedAt: new Date().toISOString(),
    },
  });

  logger.info("Tenant updated successfully", { tenantId });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Tenant updated successfully" }),
  };
};

module.exports = updateHandler;
