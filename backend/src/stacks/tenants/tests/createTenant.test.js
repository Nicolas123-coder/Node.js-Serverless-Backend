const { expect } = require("chai");
const createHandler = require("../handlers/createHandler.js");

describe("🏢 Tenants Stack", () => {
  describe("🧪 Create Tenant Handler.js", () => {
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

    const defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    };

    const mockResponse = {
      created: (data) => ({
        statusCode: 201,
        headers: defaultHeaders,
        body: JSON.stringify(data),
      }),
      badRequest: (message) => ({
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: message }),
      }),
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
        mockResponse,
        "Tenants-Table",
        body
      );

      expect(response.statusCode).to.equal(201);
      expect(response.headers).to.deep.equal(defaultHeaders);

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
        mockResponse,
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
        mockResponse,
        "Tenants-Table",
        body
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.include("Missing or invalid");
    });
  });
});
