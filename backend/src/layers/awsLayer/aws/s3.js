const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client();

/**
 * Faz upload de um arquivo para o S3.
 * @param {string} bucketName - Nome do bucket.
 * @param {string} key - Caminho e nome do arquivo no S3.
 * @param {Buffer | ReadableStream | string} body - Conteúdo do arquivo.
 * @param {string} contentType - Tipo do arquivo (ex: "application/json", "image/png").
 * @param {number} expiresInSeconds - Tempo de expiração do arquivo.
 * @returns {Promise<string>} - URL do arquivo no S3.
 */
const uploadFile = async (
  bucketName,
  key,
  body,
  contentType,
  expiresInSeconds = 3600
) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${bucketName}.s3.amazonaws.com/${key}`;
};

/**
 * Faz o download de um arquivo do S3.
 * @param {string} bucketName - Nome do bucket.
 * @param {string} key - Caminho do arquivo no S3.
 * @returns {Promise<Buffer>} - Conteúdo do arquivo.
 */
const downloadFile = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const { Body } = await s3Client.send(new GetObjectCommand(params));
  return Body;
};

/**
 * Lista arquivos dentro de um bucket S3.
 * @param {string} bucketName - Nome do bucket.
 * @param {string} prefix - Prefixo opcional para filtrar arquivos.
 * @returns {Promise<Array>} - Lista de arquivos no bucket.
 */
const listFiles = async (bucketName, prefix = "") => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  const { Contents } = await s3Client.send(new ListObjectsV2Command(params));
  return Contents ? Contents.map((item) => item.Key) : [];
};

/**
 * Exclui um arquivo do S3.
 * @param {string} bucketName - Nome do bucket.
 * @param {string} key - Caminho do arquivo no S3.
 * @returns {Promise<void>}
 */
const deleteFile = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
};

/**
 * Gera um link assinado para download do arquivo no S3.
 * @param {string} bucketName - Nome do bucket.
 * @param {string} key - Caminho do arquivo no S3.
 * @param {number} expiresInSeconds - Tempo de expiração do link (padrão: 3600s).
 * @returns {Promise<string>} - URL assinada para download do arquivo.
 */
const generatePresignedUrl = async (
  bucketName,
  key,
  expiresInSeconds = 3600
) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresInSeconds,
  };

  return s3Client.getSignedUrlPromise("getObject", params);
};

module.exports = {
  uploadFile,
  downloadFile,
  listFiles,
  deleteFile,
  generatePresignedUrl,
};
