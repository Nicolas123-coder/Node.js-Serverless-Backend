const { dynamoDB } = require("/opt/aws");
const { logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const updateTenant = require("./handlers/updateHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.TENANTS_TABLE;
    const body = JSON.parse(event.body);

    return await updateTenant(dynamoDB, logger, corsHeaders, tableName, body);
  } catch (error) {
    logger.error("Error updating tenant", {
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
