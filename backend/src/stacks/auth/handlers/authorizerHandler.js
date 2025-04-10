const generateAllowResponse = (principalId) => ({
  principalId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: "Allow",
        Resource: "*",
      },
    ],
  },
});

const generateDenyResponse = (message) => ({
  principalId: "unauthorized",
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: "Deny",
        Resource: "*",
      },
    ],
  },
  context: { message },
});

const authorizerHandler = async (jwt, logger, tokenSecret, event) => {
  try {
    logger.info("AUTH EVENT", { event });

    if (!event.authorizationToken) {
      logger.warn("No authorization token provided");
      return generateDenyResponse("No token provided");
    }

    const token = event.authorizationToken.replace("Bearer ", "");
    const decoded = jwt.verifyToken(token, tokenSecret);

    return generateAllowResponse(decoded.userId);
  } catch (error) {
    logger.warn("Token validation error", error);
    return generateDenyResponse("Invalid token");
  }
};

module.exports = authorizerHandler;
