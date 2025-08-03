import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse, parseInput } from "./lib/apigateway";
import { createPayment, Payment } from "./lib/payments";
import { randomUUID } from "crypto";
import { z } from "zod";

const paymentInputSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z
    .string()
    .min(3, "Currency must be at least 3 characters")
    .max(3, "Currency must be at most 3 characters"),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const payment = parseInput(event.body || "{}") as Payment;
    const res = paymentInputSchema.safeParse(payment);
    if (!res.success) {
      return buildResponse(422, {
        error: "Invalid input",
        details: res.error.issues,
      });
    }

    const paymentWithId = { ...payment, id: randomUUID() };
    await createPayment(paymentWithId);
    return buildResponse(201, { result: paymentWithId.id });
  } catch (error) {
    return buildResponse(500, { error: "Internal server error" });
  }
};
