const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { captureAWSv3Client } = require("aws-xray-sdk-core");

const rawClient = new DynamoDBClient();
const dynamoClient = captureAWSv3Client(rawClient);

const DynamoDBUtils = {
  marshallItem: (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    );
  },

  putItem: async (tableName, item) => {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });
    return dynamoClient.send(command);
  },

  getItem: async (tableName, key) => {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });

    const response = await dynamoClient.send(command);
    return response.Item ? unmarshall(response.Item) : null;
  },

  queryItems: async (
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    indexName = null,
    expressionAttributeNames = null,
    limit = null,
    filterExpression = null,
    scanIndexForward = true
  ) => {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ScanIndexForward: scanIndexForward,
    };

    if (indexName) {
      params.IndexName = indexName;
    }

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (limit) {
      params.Limit = limit;
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }

    let allItems = [];
    let lastEvaluatedKey = null;

    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = marshall(lastEvaluatedKey);
      }

      const command = new QueryCommand(params);
      const response = await dynamoClient.send(command);

      const items = response.Items.map((item) => unmarshall(item));
      allItems = [...allItems, ...items];

      lastEvaluatedKey = response.LastEvaluatedKey
        ? unmarshall(response.LastEvaluatedKey)
        : null;
    } while (lastEvaluatedKey);

    return allItems;
  },

  queryItemsPaginated: async (
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    indexName = null,
    expressionAttributeNames = null,
    limit = null,
    filterExpression = null,
    scanIndexForward = true,
    exclusiveStartKey = null
  ) => {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ScanIndexForward: scanIndexForward,
    };

    if (indexName) {
      params.IndexName = indexName;
    }

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (limit) {
      params.Limit = limit;
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = marshall(exclusiveStartKey);
    }

    try {
      const command = new QueryCommand(params);
      const response = await dynamoClient.send(command);

      return {
        items: response.Items.map((item) => unmarshall(item)),
        lastEvaluatedKey: response.LastEvaluatedKey
          ? unmarshall(response.LastEvaluatedKey)
          : null,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar pedidos no DynamoDB:", error);
      throw error;
    }
  },

  scanAll: async (
    tableName,
    filterExpression = null,
    expressionAttributeValues = {},
    limit = null
  ) => {
    const items = [];
    let lastEvaluatedKey = null;

    const params = {
      TableName: tableName,
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = marshall(expressionAttributeValues);
    }

    if (limit) {
      params.Limit = limit;
    }

    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = marshall(lastEvaluatedKey);
      }

      const command = new ScanCommand(params);
      const response = await dynamoClient.send(command);

      items.push(...response.Items.map((item) => unmarshall(item)));
      lastEvaluatedKey = response.LastEvaluatedKey
        ? unmarshall(response.LastEvaluatedKey)
        : null;
    } while (lastEvaluatedKey && (!limit || items.length < limit));

    return items.slice(0, limit);
  },

  scanVanilla: async (tableName) => {
    const items = [];
    let lastEvaluatedKey = null;

    do {
      const params = {
        TableName: tableName,
      };

      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const command = new ScanCommand(params);
      const response = await dynamoClient.send(command);

      const unmarshalledItems = response.Items.map((item) => unmarshall(item));
      items.push(...unmarshalledItems);

      lastEvaluatedKey = response.LastEvaluatedKey || null;
    } while (lastEvaluatedKey);

    return items;
  },

  updateItem: async (
    tableName,
    key,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames = null
  ) => {
    const params = {
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: "ALL_NEW",
    };

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const command = new UpdateItemCommand(params);
    const response = await dynamoClient.send(command);

    return response.Attributes ? unmarshall(response.Attributes) : null;
  },

  updateTenantBruteForce: async ({
    tableName,
    key,
    updateExpression,
    attributeNames,
    attributeValues,
  }) => {
    const params = {
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: {
        ":n": { S: attributeValues.name },
        ":m": { L: attributeValues.modules.map((mod) => ({ S: mod })) },
        ":a": { BOOL: attributeValues.active },
        ":u": { S: attributeValues.updatedAt },
      },
      ReturnValues: "ALL_NEW",
    };

    const command = new UpdateItemCommand(params);
    const response = await dynamoClient.send(command);
    return response.Attributes ? unmarshall(response.Attributes) : null;
  },

  deleteItem: async (tableName, key) => {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
      ReturnValues: "ALL_OLD",
    });

    const response = await dynamoClient.send(command);
    return response.Attributes ? unmarshall(response.Attributes) : null;
  },

  marshallKey: (keyObj) => {
    try {
      return marshall(keyObj);
    } catch (error) {
      console.error("❌ Erro ao marshalar chave para DynamoDB:", error);
      throw new Error("Invalid key format for DynamoDB marshalling");
    }
  },

  unmarshallKey: (keyObj) => {
    try {
      return unmarshall(keyObj);
    } catch (error) {
      console.error("❌ Erro ao unmarshalar chave do DynamoDB:", error);
      throw new Error("Invalid key format for DynamoDB unmarshalling");
    }
  },
};

module.exports = DynamoDBUtils;
