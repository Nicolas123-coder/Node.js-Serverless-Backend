const { v4: uuidv4 } = require("uuid");

module.exports = {
  generateUuid: (prefix = "") => {
    return `${prefix}${uuidv4()}`;
  },
};
