import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "./lib/apigateway";
import { listPayments, listPaymentsByCurrency } from "./lib/payments";
import { z } from "zod";

const currencySchema = z.object({
  currency: z.string().length(3, "Currency must be 3 characters"),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const currency = event.queryStringParameters?.currency;

  try {
    // If currency is provided, validate it
    if (currency !== undefined) {
      const res = currencySchema.safeParse({ currency });
      if (!res.success) {
        return buildResponse(400, {
          error: "Invalid Input",
          details: res.error.issues,
        });
      }
    }

    const payments = currency
      ? await listPaymentsByCurrency(currency)
      : await listPayments();

    return buildResponse(200, { data: payments });
  } catch (error) {
    return buildResponse(500, { error: "Internal server error" });
  }
};
