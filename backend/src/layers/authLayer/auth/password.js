const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const SALT_ROUNDS = 10;

module.exports = {
  /**
   * Gera uma senha aleatória segura.
   * @param {number} length - Tamanho da senha (padrão = 7).
   * @returns {string} - Senha aleatória gerada.
   */
  generateRandomPassword: (length = 7) => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
  },

  /**
   * Gera um hash para a senha fornecida.
   * @param {string} password - A senha em texto plano.
   * @returns {Promise<string>} - O hash gerado.
   */
  hashPassword: async (password) => {
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Compara uma senha com seu hash.
   * @param {string} password - A senha em texto plano.
   * @param {string} hash - O hash armazenado.
   * @returns {Promise<boolean>} - `true` se a senha for válida, caso contrário, `false`.
   */
  comparePassword: async (password, hash) => {
    if (!password || !hash) {
      throw new Error("Password and hash are required");
    }

    return await bcrypt.compare(password, hash);
  },
};
