const { dynamoDB } = require("/opt/aws");
const { uuid, logger, response } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const createTenant = require("./handlers/createHandler");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const tableName = process.env.TENANTS_TABLE;

    return await createTenant(
      dynamoDB,
      uuid,
      logger,
      response,
      corsHeaders,
      tableName,
      body
    );
  } catch (error) {
    logger.error("Error creating tenant", {
      error: error.message,
      stack: error.stack,
    });

    return response.serverError("Internal Server Error");
  }
};
