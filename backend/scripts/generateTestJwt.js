const jwt = require("jsonwebtoken");
const SECRET = ""; // TODO: Insert secret

const payload = {
  sub: "user-id-123",
  name: "Nicolas",
  role: "admin",
};

const token = jwt.sign(payload, SECRET, {
  algorithm: "HS256",
});

console.log("Token:", token);
