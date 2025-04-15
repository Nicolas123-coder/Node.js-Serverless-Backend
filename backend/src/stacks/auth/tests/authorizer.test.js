const { expect } = require("chai");
const authorizerHandler = require("../handlers/authorizerHandler.js");

describe("🔑 Auth Stack", () => {
  describe("🧪 Authorizer Handler", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
    };

    const tokenSecret = "fake-secret";

    const mockAuthResponse = {
      generateAllowResponse: (principalId) => ({
        principalId,
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: "*",
            },
          ],
        },
      }),
      generateDenyResponse: (message) => ({
        principalId: "unauthorized",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Deny",
              Resource: "*",
            },
          ],
        },
        context: { message },
      }),
    };

    it("retorna deny se não houver authorizationToken", async () => {
      const event = {};
      const result = await authorizerHandler(
        null, // jwt
        mockLogger,
        mockAuthResponse,
        tokenSecret,
        event
      );

      expect(result.policyDocument.Statement[0].Effect).to.equal("Deny");
      expect(result.context.message).to.include("No token");
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
        mockAuthResponse,
        tokenSecret,
        event
      );

      expect(result.policyDocument.Statement[0].Effect).to.equal("Deny");
      expect(result.context.message).to.include("Invalid token");
    });

    it("retorna allow se token válido", async () => {
      const jwt = {
        verifyToken: () => ({ userId: "123" }),
      };

      const event = { authorizationToken: "Bearer real.token" };

      const result = await authorizerHandler(
        jwt,
        mockLogger,
        mockAuthResponse,
        tokenSecret,
        event
      );

      expect(result.policyDocument.Statement[0].Effect).to.equal("Allow");
      expect(result.principalId).to.equal("123");
    });
  });
});
