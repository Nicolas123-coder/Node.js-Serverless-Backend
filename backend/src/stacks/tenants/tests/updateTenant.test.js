const { expect } = require("chai");
const updateHandler = require("../handlers/updateHandler.js");

describe("🏢 Tenants Stack", () => {
  describe("🧪 Update Tenant Handler.js", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {}, // necessário para o try/catch
    };

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
      badRequest: (message) => ({
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: message }),
      }),
      serverError: (message) => ({
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: message }),
      }),
    };

    const mockDynamoDB = {
      updateTenantBruteForce: async () => {},
    };

    it("retorna 400 se tenantId estiver ausente", async () => {
      const response = await updateHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        "Tenants-Table",
        { name: "Tenant X" } // sem tenantId
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.include("Missing tenantId");
    });

    it("retorna 400 se modules não for array", async () => {
      const response = await updateHandler(
        mockDynamoDB,
        mockLogger,
        mockResponse,
        "Tenants-Table",
        {
          tenantId: "abc",
          modules: "not-an-array",
        }
      );

      expect(response.statusCode).to.equal(400);
      const payload = JSON.parse(response.body);
      expect(payload.error).to.include("Modules must be an array");
    });

    it("executa update com sucesso (status 200)", async () => {
      let wasCalled = false;

      const dynamoMock = {
        updateTenantBruteForce: async ({ key, updateExpression }) => {
          wasCalled = true;
          expect(key).to.deep.equal({ TenantId: "tenant-123" });
          expect(updateExpression).to.include("SET");
        },
      };

      const response = await updateHandler(
        dynamoMock,
        mockLogger,
        mockResponse,
        "Tenants-Table",
        {
          tenantId: "tenant-123",
          name: "Novo Nome",
          modules: ["X"],
          active: true,
        }
      );

      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.body);
      expect(payload.message).to.include("updated successfully");
      expect(wasCalled).to.be.true;
    });

    it("faz update parcial (só active)", async () => {
      let receivedAttrs;

      const dynamoMock = {
        updateTenantBruteForce: async ({ attributeValues }) => {
          receivedAttrs = attributeValues;
        },
      };

      const response = await updateHandler(
        dynamoMock,
        mockLogger,
        mockResponse,
        "Tenants-Table",
        {
          tenantId: "tenant-789",
          active: false,
        }
      );

      expect(response.statusCode).to.equal(200);
      expect(receivedAttrs[":a"]).to.equal(false); // atualizado: agora é ":a"
    });
  });
});
