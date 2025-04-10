const { dynamoDB } = require("/opt/aws");
const { uuid, password, logger } = require("/opt/utils");

const corsHeaders = JSON.parse(process.env.CORS_HEADERS);
const createUserHandler = require("./handlers/createUserHandler");

exports.handler = async (event) => {
  try {
    const tableName = process.env.USERS_TABLE;
    const body = JSON.parse(event.body);

    return await createUserHandler(
      dynamoDB,
      uuid,
      password,
      logger,
      tableName,
      corsHeaders,
      body
    );
  } catch (error) {
    logger.error("Error creating user", {
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
