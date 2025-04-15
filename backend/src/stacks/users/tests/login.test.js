const { expect } = require("chai");
const loginHandler = require("../handlers/loginHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Login Handler", () => {
    const tableName = "Users-Table";
    const tokenSecret = "super-secret-token";

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

    it("retorna 400 se username ou password não forem informados", async () => {
      const body = { username: "john" }; // faltando password

      const response = await loginHandler(
        {}, // dynamoDB
        {}, // password
        {}, // jwt
        mockLogger,
        mockResponse,
        tableName,
        body,
        tokenSecret
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property(
        "error",
        "Username and password are required"
      );
    });

    it("retorna 401 se usuário não for encontrado", async () => {
      const mockDynamoDB = {
        queryItems: async () => [],
      };

      const body = {
        username: "john",
        password: "123",
      };

      const response = await loginHandler(
        mockDynamoDB,
        {}, // password
        {}, // jwt
        mockLogger,
        mockResponse,
        tableName,
        body,
        tokenSecret
      );

      expect(response.statusCode).to.equal(401);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "Invalid username or password");
    });

    it("retorna 401 se senha estiver incorreta", async () => {
      const mockDynamoDB = {
        queryItems: async () => [
          {
            Id: "user-123",
            Username: "john",
            Password: "hashed",
            TenantId: "tenant-1",
            Role: "admin",
          },
        ],
      };

      const mockPassword = {
        comparePassword: async () => false,
      };

      const body = {
        username: "john",
        password: "senha-errada",
      };

      const response = await loginHandler(
        mockDynamoDB,
        mockPassword,
        {}, // jwt
        mockLogger,
        mockResponse,
        tableName,
        body,
        tokenSecret
      );

      expect(response.statusCode).to.equal(401);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "Invalid username or password");
    });

    it("retorna 200 com token e dados do usuário se login for bem-sucedido", async () => {
      const user = {
        Id: "user-123",
        Username: "john",
        Password: "hashed",
        TenantId: "tenant-1",
        Role: "admin",
        ProfileImage: "https://img.com/avatar.png",
      };

      const mockDynamoDB = {
        queryItems: async () => [user],
      };

      const mockPassword = {
        comparePassword: async () => true,
      };

      const mockJwt = {
        generateToken: () => "fake-jwt-token",
      };

      const body = {
        username: "john",
        password: "correta",
      };

      const response = await loginHandler(
        mockDynamoDB,
        mockPassword,
        mockJwt,
        mockLogger,
        mockResponse,
        tableName,
        body,
        tokenSecret
      );

      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.body);

      expect(payload).to.include({
        token: "fake-jwt-token",
        tenantId: "tenant-1",
        profileImage: "https://img.com/avatar.png",
        id: "user-123",
        role: "admin",
      });
    });
  });
});
