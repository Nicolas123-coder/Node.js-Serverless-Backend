const dynamoDB = require("./dynamoDB");
const s3 = require("./s3");
const sqs = require("./sqs");
const xray = require("./xray");

module.exports = {
  dynamoDB,
  s3,
  sqs,
  xray,
};
