const { expect } = require("chai");
const updateHandler = require("../handlers/updateHandler.js");

describe("🏢 Tenants Stack", () => {
  describe("🧪 Update Tenant Handler.js", () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    const mockLogger = {
      info: () => {},
      warn: () => {},
    };

    const mockDynamoDB = {
      updateTenantBruteForce: async () => {},
    };

    it("retorna 400 se tenantId estiver ausente", async () => {
      const response = await updateHandler(
        mockDynamoDB,
        mockLogger,
        corsHeaders,
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
        corsHeaders,
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
        corsHeaders,
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
        corsHeaders,
        "Tenants-Table",
        {
          tenantId: "tenant-789",
          active: false,
        }
      );

      expect(response.statusCode).to.equal(200);
      expect(receivedAttrs.active).to.equal(false);
    });
  });
});
