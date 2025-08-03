import { randomUUID } from "crypto";
import { handler } from "../src/createPayment";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as payments from "../src/lib/payments";

describe("When the user creates a payment", () => {
  it("user didn't provide an id, a new id is generated", async () => {
    // Payment data without id
    const paymentWithoutId = {
      amount: 100,
      currency: "AUD",
    };
    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce();

    const result = await handler({
      body: JSON.stringify(paymentWithoutId),
    } as unknown as APIGatewayProxyEvent);

    // validate the response has a generated id
    expect(result.statusCode).toBe(201);

    const responseBody = JSON.parse(result.body);
    const generatedId = responseBody.result;

    // Verify that an ID was generated
    expect(generatedId).toBeDefined();
    expect(typeof generatedId).toBe("string");
    expect(generatedId.length).toBeGreaterThan(0);

    // Verify the handler generated an id
    expect(createPaymentMock).toHaveBeenCalledWith({
      ...paymentWithoutId,
      id: generatedId,
    });
  });

  it("ignores user-provided ID and generates a new unique ID", async () => {
    const paymentWithUserProvidedId = {
      id: "user-chosen-id-123", // User tries to provide their own ID
      amount: 300,
      currency: "EUR",
    };

    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce();

    const result = await handler({
      body: JSON.stringify(paymentWithUserProvidedId),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);

    const responseBody = JSON.parse(result.body);
    const generatedId = responseBody.result;

    // Verify a new ID was generated (different from user's input)
    expect(generatedId).toBeDefined();
    expect(generatedId).not.toBe("user-chosen-id-123");
    expect(typeof generatedId).toBe("string");
    expect(generatedId.length).toBeGreaterThan(0);

    // Verify the payment was created with the generated ID, not the user's ID
    expect(createPaymentMock).toHaveBeenCalledWith({
      amount: 300,
      currency: "EUR",
      id: generatedId, // Generated ID, not user's ID
    });
  });

  it("should return 422 if the input is invalid - missing amount", async () => {
    const invalidPayment = {
      currency: "AUD",
    };

    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce();

    const result = await handler({
      body: JSON.stringify(invalidPayment),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(422);
    expect(JSON.parse(result.body)).toEqual({
      error: "Invalid input",
      details: expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_type",
          expected: "number",
          path: ["amount"],
        }),
      ]),
    });
    expect(createPaymentMock).not.toHaveBeenCalled();
  });

  it("should return 422 if the input is invalid - negative amount", async () => {
    const invalidPayment = {
      amount: -100,
      currency: "AUD",
    };

    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce();

    const result = await handler({
      body: JSON.stringify(invalidPayment),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(422);
    expect(JSON.parse(result.body)).toEqual({
      error: "Invalid input",
      details: expect.arrayContaining([
        expect.objectContaining({
          code: "too_small",
          minimum: 0,
          inclusive: false,
          path: ["amount"],
        }),
      ]),
    });
    expect(createPaymentMock).not.toHaveBeenCalled();
  });

  it("should return 422 if the input is invalid - invalid currency format", async () => {
    const invalidPayment = {
      amount: 100,
      currency: "AUDD", // Too long
    };

    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce();

    const result = await handler({
      body: JSON.stringify(invalidPayment),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(422);
    expect(JSON.parse(result.body)).toEqual({
      error: "Invalid input",
      details: expect.arrayContaining([
        expect.objectContaining({
          code: "too_big",
          maximum: 3,
          path: ["currency"],
        }),
      ]),
    });
    expect(createPaymentMock).not.toHaveBeenCalled();
  });

  it("should return 422 if the input is invalid - currency too short", async () => {
    const invalidPayment = {
      amount: 100,
      currency: "AU", // Too short
    };

    const createPaymentMock = jest
      .spyOn(payments, "createPayment")
      .mockResolvedValueOnce();

    const result = await handler({
      body: JSON.stringify(invalidPayment),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(422);
    expect(JSON.parse(result.body)).toEqual({
      error: "Invalid input",
      details: expect.arrayContaining([
        expect.objectContaining({
          code: "too_small",
          minimum: 3,
          inclusive: true,
          path: ["currency"],
        }),
      ]),
    });
    expect(createPaymentMock).not.toHaveBeenCalled();
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
