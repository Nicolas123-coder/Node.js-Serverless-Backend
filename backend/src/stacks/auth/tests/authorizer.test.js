const { expect } = require("chai");
const authorizerHandler = require("../handlers/authorizerHandler.js");

describe("🔑 Auth Stack", () => {
  describe("🧪 Authorizer Handler", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
    };
    const tokenSecret = "fake-secret";

    it("retorna deny se não houver authorizationToken", async () => {
      const event = {};
      const result = await authorizerHandler(
        null,
        mockLogger,
        tokenSecret,
        event
      );

      expect(result.policyDocument.Statement[0].Effect).to.equal("Deny");
    });

    it("retorna deny se token inválido", async () => {
      const jwt = {
        verifyToken: () => {
          throw new Error("invalid");
        },
      };
      const event = { authorizationToken: "Bearer fake" };
      const result = await authorizerHandler(
        jwt,
        mockLogger,
        tokenSecret,
        event
      );

      expect(result.policyDocument.Statement[0].Effect).to.equal("Deny");
    });

    it("retorna allow se token válido", async () => {
      const jwt = {
        verifyToken: () => ({ userId: "123" }),
      };
      const event = { authorizationToken: "Bearer real.token" };
      const result = await authorizerHandler(
        jwt,
        mockLogger,
        tokenSecret,
        event
      );

      expect(result.policyDocument.Statement[0].Effect).to.equal("Allow");
      expect(result.principalId).to.equal("123");
    });
  });
});
