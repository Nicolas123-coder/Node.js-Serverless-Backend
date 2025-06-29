const {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} = require("@aws-sdk/client-sqs");
const { captureAWSv3Client } = require("aws-xray-sdk-core");

const rawSqsClient = new SQSClient();
const sqsClient = captureAWSv3Client(rawSqsClient);

const SQSUtils = {
  /**
   * Envia uma mensagem para a fila SQS.
   * @param {string} queueUrl - URL da fila SQS.
   * @param {Object|string} messageBody - Corpo da mensagem. Se não for string, será convertido para JSON.
   * @param {Object} options - Opções adicionais (ex: DelaySeconds, MessageAttributes).
   * @returns {Promise<Object>} - Resposta da operação.
   */
  sendMessage: async (queueUrl, messageBody, options = {}) => {
    const params = {
      QueueUrl: queueUrl,
      MessageBody:
        typeof messageBody === "string"
          ? messageBody
          : JSON.stringify(messageBody),
      ...options,
    };

    const command = new SendMessageCommand(params);
    return await sqsClient.send(command);
  },

  /**
   * Recebe mensagens da fila SQS.
   * @param {string} queueUrl - URL da fila SQS.
   * @param {Object} options - Opções adicionais (ex: MaxNumberOfMessages, WaitTimeSeconds).
   * @returns {Promise<Array>} - Array com as mensagens recebidas.
   */
  receiveMessages: async (queueUrl, options = {}) => {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10, // Máximo permitido por chamada
      ...options,
    };

    const command = new ReceiveMessageCommand(params);
    const response = await sqsClient.send(command);
    return response.Messages || [];
  },

  /**
   * Exclui uma mensagem da fila SQS.
   * @param {string} queueUrl - URL da fila SQS.
   * @param {string} receiptHandle - ReceiptHandle da mensagem a ser excluída.
   * @returns {Promise<Object>} - Resposta da operação.
   */
  deleteMessage: async (queueUrl, receiptHandle) => {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    const command = new DeleteMessageCommand(params);
    return await sqsClient.send(command);
  },

  /**
   * Obtém atributos da fila SQS.
   * @param {string} queueUrl - URL da fila SQS.
   * @param {Array} attributeNames - Lista de nomes de atributos a serem obtidos (padrão: ["All"]).
   * @returns {Promise<Object>} - Atributos da fila.
   */
  getQueueAttributes: async (queueUrl, attributeNames = ["All"]) => {
    const params = {
      QueueUrl: queueUrl,
      AttributeNames: attributeNames,
    };

    const command = new GetQueueAttributesCommand(params);
    const response = await sqsClient.send(command);
    return response.Attributes;
  },
};

module.exports = SQSUtils;
