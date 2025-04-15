const { expect } = require("chai");
const deleteUserHandler = require("../handlers/deleteUserHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Delete User Handler", () => {
    const tableName = "Users-Table";

    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    };

    const mockResponse = {
      badRequest: (msg) => ({
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: msg }),
      }),
      buildResponse: (code, payload) => ({
        statusCode: code,
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      }),
      success: (data) => ({
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify(data),
      }),
    };

    it("retorna 400 se userId não for informado", async () => {
      const mockDynamoDB = {};

      const response = await deleteUserHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        {} // pathParameters vazio
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "userId is required");
    });

    it("retorna 404 se usuário não for encontrado", async () => {
      const mockDynamoDB = {
        getItem: async () => null,
      };

      const pathParameters = { userId: "nonexistent-user" };

      const response = await deleteUserHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        pathParameters
      );

      expect(response.statusCode).to.equal(404);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "User not found");
    });

    it("deleta o usuário com sucesso e retorna 200", async () => {
      const mockDynamoDB = {
        getItem: async () => ({ Id: "user-123", Username: "johndoe" }),
        deleteItem: async () => {},
      };

      const pathParameters = { userId: "user-123" };

      const response = await deleteUserHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        pathParameters
      );

      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("message", "User deleted successfully");
    });
  });
});
