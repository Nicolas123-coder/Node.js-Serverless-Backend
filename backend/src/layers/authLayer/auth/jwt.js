const jwt = require("jsonwebtoken");

const generateToken = (payload, secret, expiresIn = "3h") => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("❌ Invalid Token:", error.message);

    return null;
  }
};

module.exports = { generateToken, verifyToken };
