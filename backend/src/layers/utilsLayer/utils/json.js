const jsonfile = require("jsonfile");
const fs = require("fs");
const path = require("path");
const os = require("os");

const JSONUtils = {
  /**
   * Escreve um objeto JSON em um arquivo temporário.
   * @param {string} fileNamePrefix - Prefixo do nome do arquivo.
   * @param {Object} data - Dados a serem salvos no arquivo.
   * @returns {string} - Caminho do arquivo criado.
   */
  writeJsonToFile: (fileNamePrefix, data) => {
    const tempDir = os.tmpdir();
    const fileName = `${fileNamePrefix}_${Date.now()}.json`;
    const filePath = path.join(tempDir, fileName);

    jsonfile.writeFileSync(filePath, data, { spaces: 2 });

    return filePath;
  },

  /**
   * Lê um arquivo JSON e retorna seu conteúdo.
   * @param {string} filePath - Caminho do arquivo JSON.
   * @returns {Object} - Conteúdo do arquivo JSON.
   */
  readJsonFromFile: (filePath) => {
    return jsonfile.readFileSync(filePath);
  },

  /**
   * Exclui um arquivo JSON.
   * @param {string} filePath - Caminho do arquivo a ser removido.
   */
  deleteJsonFile: (filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },
};

module.exports = JSONUtils;
