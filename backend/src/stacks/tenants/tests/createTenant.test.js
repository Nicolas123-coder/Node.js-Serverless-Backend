const { expect } = require("chai");
const createHandler = require("../handlers/createHandler.js");

describe("🏢 Tenants Stack", () => {
  describe("🧪 Create Tenant Handler.js", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    const mockUuid = {
      generateUuid: () => "mocked-uuid-123",
    };

    const mockDynamoDB = {
      putItem: async () => {}, // mock de sucesso
    };

    const mockLogger = {
      info: () => {},
      warn: () => {},
    };

    it("cria tenant com sucesso", async () => {
      const body = {
        name: "Tenant Teste",
        modules: ["MODULO_1", "MODULO_2"],
      };

      const response = await createHandler(
        mockDynamoDB,
        mockUuid,
        mockLogger,
        corsHeaders,
        "Tenants-Table",
        body
      );

      expect(response.statusCode).to.equal(201);
      expect(response.headers).to.deep.equal(corsHeaders);

      const payload = JSON.parse(response.body);
      expect(payload.tenant.Name).to.equal("Tenant Teste");
      expect(payload.tenant.Modules).to.deep.equal(["MODULO_1", "MODULO_2"]);
      expect(payload.tenant.TenantId).to.equal("mocked-uuid-123");
    });

    it("retorna erro se faltar campos obrigatórios", async () => {
      const body = { modules: ["X"] }; // sem nome

      const response = await createHandler(
        mockDynamoDB,
        mockUuid,
        mockLogger,
        corsHeaders,
        "Tenants-Table",
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.include("Missing or invalid");
    });

    it("retorna erro se modules não for array", async () => {
      const body = {
        name: "Tenant",
        modules: "not-an-array",
      };

      const response = await createHandler(
        mockDynamoDB,
        mockUuid,
        mockLogger,
        corsHeaders,
        "Tenants-Table",
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.include("Missing or invalid");
    });
  });
});
