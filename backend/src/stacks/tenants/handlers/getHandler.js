const getHandler = async (dynamoDB, logger, corsHeaders, tableName) => {
  logger.info("Fetching tenants...");

  try {
    const tenants = await dynamoDB.scanVanilla(tableName);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(tenants),
    };
  } catch (error) {
    logger.error("Error listing tenants", {
      error: error.message,
      stack: error.stack,
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

module.exports = getHandler;
