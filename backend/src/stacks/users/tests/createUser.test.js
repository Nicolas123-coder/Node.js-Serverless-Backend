const { expect } = require("chai");
const createUserHandler = require("../handlers/createUserHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Create User Handler", () => {
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
      buildResponse: (code, data) => ({
        statusCode: code,
        headers: defaultHeaders,
        body: JSON.stringify(data),
      }),
      created: (data) => ({
        statusCode: 201,
        headers: defaultHeaders,
        body: JSON.stringify(data),
      }),
    };

    const validBody = {
      username: "johndoe",
      email: "john@example.com",
      tenantId: "tenant-123",
      role: "admin",
      createdBy: "admin-user",
    };

    it("retorna 400 se faltar campos obrigatórios", async () => {
      const body = {
        email: "john@example.com", // faltando campos obrigatórios
      };

      const mockDynamoDB = {};
      const mockUuid = {};
      const mockPassword = {};

      const response = await createUserHandler(
        mockDynamoDB,
        mockUuid,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "Missing required fields");
    });

    it("retorna 409 se usuário já existe", async () => {
      const mockDynamoDB = {
        queryItems: async () => [{ Username: "johndoe" }],
      };
      const mockUuid = {};
      const mockPassword = {};

      const response = await createUserHandler(
        mockDynamoDB,
        mockUuid,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        validBody
      );

      expect(response.statusCode).to.equal(409);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property(
        "error",
        "User with this username already exists"
      );
    });

    it("cria usuário com sucesso e retorna 201", async () => {
      const mockDynamoDB = {
        queryItems: async () => [],
        putItem: async () => {},
      };

      const mockUuid = {
        generateUuid: () => "generated-uuid-123",
      };

      const mockPassword = {
        generateRandomPassword: () => "senha-gerada",
        hashPassword: async () => "senha-hash",
      };

      const body = {
        ...validBody,
        profileImage: "https://avatar.com/john.png",
        active: false,
      };

      const response = await createUserHandler(
        mockDynamoDB,
        mockUuid,
        mockPassword,
        mockLogger,
        mockResponse,
        tableName,
        body
      );

      expect(response.statusCode).to.equal(201);
      const payload = JSON.parse(response.body);

      expect(payload).to.have.property("user");
      expect(payload.user).to.include({
        TenantId: "tenant-123",
        Id: "generated-uuid-123",
        Username: "johndoe",
        Email: "john@example.com",
        Role: "admin",
        CreatedBy: "admin-user",
        ProfileImage: "https://avatar.com/john.png",
        Active: false,
      });

      expect(payload.user).to.not.have.property("Password");
      expect(payload).to.have.property("password", "senha-gerada");
    });
  });
});
