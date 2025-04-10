const { expect } = require("chai");
const deleteUserHandler = require("../handlers/deleteUserHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Delete User Handler", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    const tableName = "Users-Table";

    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    it("retorna 400 se userId não for informado", async () => {
      const mockDynamoDB = {};

      const response = await deleteUserHandler(
        mockDynamoDB,
        mockLogger,
        corsHeaders,
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
        corsHeaders,
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
        corsHeaders,
        tableName,
        pathParameters
      );

      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("message", "User deleted successfully");
    });
  });
});
