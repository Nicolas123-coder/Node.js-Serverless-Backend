const { expect } = require("chai");
const getHandler = require("../handlers/getHandler.js");

describe("🏢 Tenants Stack", () => {
  describe("🧪 Get Tenants Handler", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    it("retorna tenants com sucesso (status 200)", async () => {
      const mockLogger = {
        info: () => {},
        error: () => {},
      };

      const mockDynamoDB = {
        scanVanilla: async () => [
          { TenantId: "tenant-1", Name: "Empresa X" },
          { TenantId: "tenant-2", Name: "Empresa Y" },
        ],
      };

      const response = await getHandler(
        mockDynamoDB,
        mockLogger,
        corsHeaders,
        "Tenants-Table"
      );

      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal(corsHeaders);

      const tenants = JSON.parse(response.body);
      expect(tenants).to.be.an("array").with.lengthOf(2);
      expect(tenants[0].TenantId).to.equal("tenant-1");
    });

    it("retorna erro se scanVanilla falhar (status 500)", async () => {
      const mockLogger = {
        info: () => {},
        error: () => {},
      };

      const mockDynamoDB = {
        scanVanilla: async () => {
          throw new Error("DB falhou");
        },
      };

      const response = await getHandler(
        mockDynamoDB,
        mockLogger,
        corsHeaders,
        "Tenants-Table"
      );

      expect(response.statusCode).to.equal(500);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "Internal Server Error");
    });
  });
});
