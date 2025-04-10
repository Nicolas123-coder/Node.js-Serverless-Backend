const { expect } = require("chai");
const changePasswordHandler = require("../handlers/changePasswordHandler.js");

describe("👤 Users Stack", () => {
  describe("🧪 Change Password Handler", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    const tableName = "Users-Table";

    const mockLogger = {
      info: () => {},
      error: () => {},
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
        tableName,
        corsHeaders,
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property(
        "error",
        "tenantId, userId, oldPassword, and newPassword are required"
      );
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
        tableName,
        corsHeaders,
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
        tableName,
        corsHeaders,
        body
      );

      expect(response.statusCode).to.equal(403);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "Old password is incorrect");
    });

    it("atualiza a senha com sucesso e retorna 200", async () => {
      const mockDynamoDB = {
        getItem: async () => ({ Id: "user-123", Password: "senha-antiga" }),
        updateItem: async () => {}, // só mocka, não precisa retornar nada
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
        tableName,
        corsHeaders,
        body
      );

      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property(
        "message",
        "Password updated successfully"
      );
    });
  });
});
