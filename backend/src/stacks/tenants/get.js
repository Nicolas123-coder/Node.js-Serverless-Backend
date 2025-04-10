const { dynamoDB } = require("/opt/aws");
const { logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const getTenants = require("./handlers/getHandler");

exports.handler = async () => {
  const tableName = process.env.TENANTS_TABLE;

  return await getTenants(dynamoDB, logger, corsHeaders, tableName);
};
