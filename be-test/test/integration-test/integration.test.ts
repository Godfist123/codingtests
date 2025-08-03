import { execSync } from "child_process";
import axios from "axios";

let apiUrl: string;

describe("Payment API Integration Tests", () => {
  beforeAll(async () => {
    console.log("Deploying infrastructure...");

    // Deploy stack before tests
    execSync(
      "cdk deploy BeTestStack --require-approval never --output cdk.out.integration",
      {
        stdio: "inherit",
      }
    );

    // Read API URL from CloudFormation outputs
    const outputs = JSON.parse(
      execSync(
        "aws cloudformation describe-stacks --stack-name BeTestStack --query 'Stacks[0].Outputs' --output json"
      ).toString()
    );
    const apiUrlOutput = outputs.find(
      (output: any) => output.OutputKey === "ApiUrl"
    );
    apiUrl = apiUrlOutput.OutputValue;

    console.log(`API URL: ${apiUrl}`);

    // Wait a bit for the API to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }, 10 * 60 * 1000); // 10 min timeout for deploy

  describe("Payment Creation", () => {
    it("should create a payment successfully", async () => {
      const response = await axios.post(`${apiUrl}payments`, {
        amount: 150,
        currency: "USD",
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("result");
      expect(typeof response.data.result).toBe("string");
    });

    it("should reject payment with invalid amount", async () => {
      try {
        await axios.post(`${apiUrl}payments`, {
          amount: -50,
          currency: "USD",
        });
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.error).toBe("Invalid input");
      }
    });

    it("should reject payment with missing required fields", async () => {
      try {
        await axios.post(`${apiUrl}payments`, {
          currency: "USD",
          // Missing amount
        });
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.error).toBe("Invalid input");
      }
    });
  });

  describe("Payment Retrieval", () => {
    let createdPaymentId: string;

    beforeEach(async () => {
      // Create a payment for retrieval tests
      const createResponse = await axios.post(`${apiUrl}payments`, {
        amount: 200,
        currency: "EUR",
      });
      createdPaymentId = createResponse.data.result;
    });

    it("should retrieve a payment by ID", async () => {
      const response = await axios.get(`${apiUrl}payments/${createdPaymentId}`);

      expect(response.status).toBe(200);
      expect(response.data.paymentId).toBe(createdPaymentId);
      expect(response.data.amount).toBe(200);
      expect(response.data.currency).toBe("EUR");
    });

    it("should return 404 for non-existent payment", async () => {
      try {
        await axios.get(`${apiUrl}payments/non-existent-id`);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe("Payment not found");
      }
    });
  });

  describe("Payment Listing", () => {
    beforeEach(async () => {
      // Create some test payments
      await axios.post(`${apiUrl}payments`, {
        amount: 100,
        currency: "USD",
      });
      await axios.post(`${apiUrl}payments`, {
        amount: 200,
        currency: "EUR",
      });
    });

    it("should list all payments", async () => {
      const response = await axios.get(`${apiUrl}payments`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it("should filter payments by currency", async () => {
      const response = await axios.get(`${apiUrl}payments`, {
        params: { currency: "USD" },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);

      // All returned payments should have USD currency
      response.data.data.forEach((payment: any) => {
        expect(payment.currency).toBe("USD");
      });
    });

    it("should handle pagination parameters", async () => {
      const response = await axios.get(`${apiUrl}payments`, {
        params: { limit: "1" },
      });

      expect(response.status).toBe(200);
      // Note: Pagination is not implemented yet, so we just verify the API accepts the parameter
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe("Complete Payment Lifecycle", () => {
    it("should handle create, retrieve, and list operations", async () => {
      // Step 1: Create a payment
      const createResponse = await axios.post(`${apiUrl}payments`, {
        amount: 500,
        currency: "JPY",
      });

      expect(createResponse.status).toBe(201);
      const paymentId = createResponse.data.result;
      expect(paymentId).toBeDefined();

      // Step 2: Retrieve the payment
      const getResponse = await axios.get(`${apiUrl}payments/${paymentId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.paymentId).toBe(paymentId);
      expect(getResponse.data.amount).toBe(500);
      expect(getResponse.data.currency).toBe("JPY");

      // Step 3: Verify it appears in the list
      const listResponse = await axios.get(`${apiUrl}payments`);
      expect(listResponse.status).toBe(200);

      const foundPayment = listResponse.data.data.find(
        (p: any) => p.paymentId === paymentId
      );
      expect(foundPayment).toBeDefined();
      expect(foundPayment.amount).toBe(500);
      expect(foundPayment.currency).toBe("JPY");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid endpoints", async () => {
      try {
        await axios.get(`${apiUrl}invalid-endpoint`);
        fail("Should have thrown an error");
      } catch (error: any) {
        // API Gateway returns 403 for invalid endpoints
        expect(error.response.status).toBe(403);
      }
    });

    it("should handle malformed JSON requests", async () => {
      try {
        await axios.post(`${apiUrl}payments`, "invalid json {", {
          headers: { "Content-Type": "application/json" },
        });
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.error).toBe("Invalid input");
      }
    });
  });

  afterAll(() => {
    console.log("Cleaning up infrastructure...");
    // Cleanup after tests
    execSync("cdk destroy BeTestStack --force --output cdk.out.integration", {
      stdio: "inherit",
    });
  }, 10 * 60 * 1000);
});
