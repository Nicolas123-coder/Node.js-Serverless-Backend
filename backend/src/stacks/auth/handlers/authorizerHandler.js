const authorizerHandler = async (
  jwt,
  logger,
  authResponse,
  tokenSecret,
  event
) => {
  try {
    logger.info("EVENT", { event });

    if (!event.authorizationToken) {
      logger.warn("No authorization token provided");

      return authResponse.generateDenyResponse("No token provided");
    }

    const token = event.authorizationToken.replace("Bearer ", "");
    const decoded = jwt.verifyToken(token, tokenSecret);

    return authResponse.generateAllowResponse(decoded.userId);
  } catch (error) {
    logger.warn("Token validation error", error);

    return authResponse.generateDenyResponse("Invalid token");
  }
};

module.exports = authorizerHandler;
