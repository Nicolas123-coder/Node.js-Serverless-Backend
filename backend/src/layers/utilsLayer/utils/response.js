const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const buildResponse = (statusCode, data, customHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...DEFAULT_CORS_HEADERS,
    ...customHeaders,
  };

  return {
    statusCode,
    headers,
    body: JSON.stringify(data),
  };
};

const success = (data, headers) => buildResponse(200, data, headers);
const created = (data, headers) => buildResponse(201, data, headers);
const badRequest = (message, headers) =>
  buildResponse(400, { error: message }, headers);
const serverError = (message, headers) =>
  buildResponse(500, { error: message }, headers);

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

module.exports = {
  success,
  created,
  badRequest,
  serverError,
  buildResponse,
  generateAllowResponse,
  generateDenyResponse,
};
