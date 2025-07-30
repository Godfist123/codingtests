import { randomUUID } from "crypto";
import * as payments from "../src/lib/payments";
import { handler } from "../src/listPayments";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("When the user request a list of payments", () => {
  it("should return all payments if user didn't provide currency", async () => {
    const mockPayments = [
      { id: randomUUID(), currency: "AUD", amount: 100 },
      { id: randomUUID(), currency: "USD", amount: 200 },
      { id: randomUUID(), currency: "EUR", amount: 300 },
    ];
    const listPaymentsMock = jest
      .spyOn(payments, "listPayments")
      .mockResolvedValue(mockPayments);

    const res = await handler({
      queryStringParameters: {},
    } as unknown as APIGatewayProxyEvent);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({ data: mockPayments }));
    expect(listPaymentsMock).toHaveBeenCalled();
  });

  it("should return payments filtered by currency", async () => {
    const mockAUDPayments = [
      { id: randomUUID(), currency: "AUD", amount: 100 },
      { id: randomUUID(), currency: "AUD", amount: 200 },
    ];

    const listPaymentsByCurrencyMock = jest
      .spyOn(payments, "listPaymentsByCurrency")
      .mockResolvedValueOnce(mockAUDPayments);

    const res = await handler({
      queryStringParameters: { currency: "AUD" },
    } as unknown as APIGatewayProxyEvent);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({ data: mockAUDPayments }));
    expect(listPaymentsByCurrencyMock).toHaveBeenCalledWith("AUD");
  });

  it("should return empty array if there's no payments for the given currency", async () => {
    const listPaymentsByCurrencyMock = jest
      .spyOn(payments, "listPaymentsByCurrency")
      .mockResolvedValueOnce([]);

    const res = await handler({
      queryStringParameters: { currency: "AUD" },
    } as unknown as APIGatewayProxyEvent);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({ data: [] }));
    expect(listPaymentsByCurrencyMock).toHaveBeenCalledWith("AUD");
  });

  it("Returns 400 error when currency parameter is empty", async () => {
    const listPaymentsByCurrencyMock = jest
      .spyOn(payments, "listPaymentsByCurrency")
      .mockResolvedValueOnce([]);

    const result = await handler({
      queryStringParameters: {
        currency: "",
      },
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: "Currency parameter cannot be empty",
    });
    expect(listPaymentsByCurrencyMock).not.toHaveBeenCalled();
  });

  it("Returns 400 error when currency parameter is not 3 characters", async () => {
    const listPaymentsByCurrencyMock = jest
      .spyOn(payments, "listPaymentsByCurrency")
      .mockResolvedValueOnce([]);

    const result = await handler({
      queryStringParameters: {
        currency: "AUDD",
      },
    } as unknown as APIGatewayProxyEvent);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: "Invalid Input",
      details: expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_string",
          message: "String must contain exactly 3 character(s)",
          path: ["currency"],
        }),
      ]),
    });
    expect(listPaymentsByCurrencyMock).not.toHaveBeenCalled();
  });

  it("Returns 400 error when currency parameter is not a string", async () => {
    const listPaymentsByCurrencyMock = jest
      .spyOn(payments, "listPaymentsByCurrency")
      .mockResolvedValueOnce([]);

    const result = await handler({
      queryStringParameters: {
        currency: 123,
      },
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: "Invalid Input",
      details: expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_type",
          message: "Expected type string, received number",
          path: ["currency"],
        }),
      ]),
    });
    expect(listPaymentsByCurrencyMock).not.toHaveBeenCalled();
  });

  it("Returns 500 error when there's an error", async () => {
    const listPaymentsByCurrencyMock = jest
      .spyOn(payments, "listPaymentsByCurrency")
      .mockRejectedValueOnce(new Error("Internal server error"));

    const result = await handler({
      queryStringParameters: {
        currency: "AUD",
      },
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: "Internal server error",
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
