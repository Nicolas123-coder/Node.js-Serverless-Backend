const { expect } = require("chai");
const listUsersHandler = require("../handlers/getUsersHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 List Users Handler", () => {
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

    it("retorna 400 se tenantId não for informado", async () => {
      const mockDynamoDB = {};

      const response = await listUsersHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        {} // queryStringParameters vazio
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "tenantId is required");
    });

    it("retorna lista de usuários sem campo Password", async () => {
      const mockDynamoDB = {
        queryItems: async () => [
          {
            Id: "user-1",
            Username: "johndoe",
            Password: "segredo",
            Email: "john@example.com",
          },
          {
            Id: "user-2",
            Username: "janedoe",
            Password: "supersecreto",
            Email: "jane@example.com",
          },
        ],
      };

      const queryStringParameters = {
        tenantId: "tenant-xyz",
      };

      const response = await listUsersHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        tableName,
        queryStringParameters
      );

      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal(defaultHeaders);

      const users = JSON.parse(response.body);
      expect(users).to.be.an("array").with.lengthOf(2);
      users.forEach((user) => {
        expect(user).to.not.have.property("Password");
        expect(user).to.have.all.keys("Id", "Username", "Email");
      });
    });
  });
});
