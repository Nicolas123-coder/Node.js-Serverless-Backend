const { expect } = require("chai");
const updateUserHandler = require("../handlers/updateUserHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Update User Handler", () => {
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
      serverError: (msg) => ({
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: msg }),
      }),
    };

    it("retorna 400 se tenantId ou userId não forem informados", async () => {
      const body = { role: "admin" };

      const response = await updateUserHandler(
        {}, // dynamoDB
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property(
        "error",
        "tenantId and userId are required"
      );
    });

    it("retorna 404 se usuário não for encontrado", async () => {
      const mockDynamoDB = {
        getItem: async () => null,
      };

      const body = {
        tenantId: "tenant-1",
        userId: "user-123",
        role: "editor",
      };

      const response = await updateUserHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(404);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "User not found");
    });

    it("atualiza role e retorna usuário sem senha (200)", async () => {
      const mockDynamoDB = {
        getItem: async () => ({
          Id: "user-123",
          Username: "johndoe",
          Password: "senha-velha",
        }),
        updateItem: async () => ({
          Id: "user-123",
          Username: "johndoe",
          Role: "admin",
          ProfileImage: "https://img.com/avatar.png",
          Active: true,
          Password: "senha-velha",
        }),
      };

      const body = {
        tenantId: "tenant-1",
        userId: "user-123",
        role: "admin",
        profileImage: "https://img.com/avatar.png",
        active: true,
      };

      const response = await updateUserHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(200);

      const payload = JSON.parse(response.body);

      expect(payload).to.have.property("message", "User updated successfully");
      expect(payload.user).to.include({
        Id: "user-123",
        Username: "johndoe",
        Role: "admin",
        ProfileImage: "https://img.com/avatar.png",
        Active: true,
      });

      expect(payload.user).to.not.have.property("Password");
    });
  });
});
