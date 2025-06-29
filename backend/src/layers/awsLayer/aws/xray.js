const AWSXRay = require("aws-xray-sdk-core");

/**
 * Retorna o trace ID atual da execução da Lambda.
 * @returns {string | undefined} Trace ID do X-Ray (ex: "1-6654bc39-7e10d8e338d1b0e763c78c25")
 */
const getTraceId = () => {
  const segment = AWSXRay.getSegment();
  return segment?.trace_id;
};

module.exports = {
  getTraceId,
};
