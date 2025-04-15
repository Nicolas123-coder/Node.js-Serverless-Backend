const updateHandler = async (dynamoDB, logger, response, tableName, body) => {
  logger.info("EVENT", { event: body });

  const { tenantId, name, modules, active } = body;

  if (!tenantId) {
    logger.warn("Update tenant failed - Missing tenantId");

    return response.badRequest("Missing tenantId");
  }

  if (modules && !Array.isArray(modules)) {
    return response.badRequest("Modules must be an array");
  }

  try {
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
    expressionAttributeValues[":u"] = new Date().toISOString();

    const updateExpression = "SET " + updateExpressionParts.join(", ");

    await dynamoDB.updateTenantBruteForce({
      tableName,
      key: { TenantId: tenantId },
      updateExpression,
      attributeNames: expressionAttributeNames,
      attributeValues: expressionAttributeValues,
    });

    logger.info("Tenant updated successfully", { tenantId });

    return response.success({ message: "Tenant updated successfully" });
  } catch (error) {
    logger.error("Error updating tenant", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = updateHandler;
