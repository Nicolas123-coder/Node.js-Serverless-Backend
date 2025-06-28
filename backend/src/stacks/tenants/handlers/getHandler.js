const getHandler = async (dynamoDB, logger, response, tableName) => {
  logger.info("Fetching tenants...");

  try {
    const tenants = await dynamoDB.scanVanilla(tableName);

    console.debug("teste 123");

    return response.success(tenants);
  } catch (error) {
    logger.error("Error listing tenants", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};

module.exports = getHandler;
