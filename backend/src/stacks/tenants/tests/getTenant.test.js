const { expect } = require("chai");
const getHandler = require("../handlers/getHandler.js");

describe("🏢 Tenants Stack", () => {
  describe("🧪 Get Tenants Handler", () => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    };

    const mockResponse = {
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
        mockResponse,
        "Tenants-Table"
      );

      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal(defaultHeaders);

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
        mockResponse,
        "Tenants-Table"
      );

      expect(response.statusCode).to.equal(500);
      const payload = JSON.parse(response.body);
      expect(payload).to.have.property("error", "Internal Server Error");
    });
  });
});
