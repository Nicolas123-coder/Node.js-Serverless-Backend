const { expect } = require("chai");
const changePasswordHandler = require("../handlers/changePasswordHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Change Password Handler", () => {
    const tableName = "Users-Table";

    const mockLogger = {
      info: () => {},
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
      buildResponse: (statusCode, data) => ({
        statusCode,
        headers: defaultHeaders,
        body: JSON.stringify(data),
      }),
      success: (data) => ({
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify(data),
      }),
      serverError: (msg) => ({
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: msg }),
      }),
    };

    it("retorna erro 400 se faltar algum campo", async () => {
      const mockDynamoDB = {};
      const mockPassword = {};

      const body = {
        userId: "user-123",
        oldPassword: "123",
        // falta tenantId e newPassword
      };

      const response = await changePasswordHandler(
        mockDynamoDB,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.include("tenantId, userId, oldPassword");
    });

    it("retorna erro 404 se usuário não for encontrado", async () => {
      const mockDynamoDB = {
        getItem: async () => null,
      };
      const mockPassword = {};

      const body = {
        tenantId: "tenant-1",
        userId: "user-123",
        oldPassword: "123",
        newPassword: "abc",
      };

      const response = await changePasswordHandler(
        mockDynamoDB,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(404);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "User not found");
    });

    it("retorna erro 403 se a senha antiga estiver incorreta", async () => {
      const mockDynamoDB = {
        getItem: async () => ({ Id: "user-123", Password: "hashed-senha" }),
      };
      const mockPassword = {
        comparePassword: async () => false,
      };

      const body = {
        tenantId: "tenant-1",
        userId: "user-123",
        oldPassword: "senha-errada",
        newPassword: "nova-senha",
      };

      const response = await changePasswordHandler(
        mockDynamoDB,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(403);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.equal("Old password is incorrect");
    });

    it("atualiza a senha com sucesso e retorna 200", async () => {
      const mockDynamoDB = {
        getItem: async () => ({ Id: "user-123", Password: "senha-antiga" }),
        updateItem: async () => {}, // apenas mocka
      };

      const mockPassword = {
        comparePassword: async () => true,
        hashPassword: async () => "senha-hash-nova",
      };

      const body = {
        tenantId: "tenant-1",
        userId: "user-123",
        oldPassword: "senha-antiga",
        newPassword: "senha-nova",
      };

      const response = await changePasswordHandler(
        mockDynamoDB,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.body);
      expect(payload.message).to.equal("Password updated successfully");
    });
  });
});
