const { expect } = require("chai");
const listUsersHandler = require("../handlers/getUsersHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 List Users Handler", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    const tableName = "Users-Table";

    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    it("retorna 400 se tenantId não for informado", async () => {
      const mockDynamoDB = {};

      const response = await listUsersHandler(
        mockDynamoDB,
        mockLogger,
        corsHeaders,
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
        corsHeaders,
        tableName,
        queryStringParameters
      );

      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal(corsHeaders);

      const users = JSON.parse(response.body);

      expect(users).to.be.an("array").with.lengthOf(2);
      users.forEach((user) => {
        expect(user).to.not.have.property("Password");
        expect(user).to.have.all.keys("Id", "Username", "Email");
      });
    });
  });
});
