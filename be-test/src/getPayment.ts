import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "./lib/apigateway";
import { getPayment } from "./lib/payments";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Extract payment ID from path parameters
  const paymentId = event.pathParameters?.id;

  if (!paymentId) {
    return buildResponse(400, { error: "Payment ID is required" });
  }

  try {
    // Retrieve payment from DynamoDB
    const payment = await getPayment(paymentId);

    if (!payment) {
      return buildResponse(404, { error: "Payment not found" });
    }

    // Return the payment data to the user
    return buildResponse(200, payment);
  } catch (error) {
    return buildResponse(500, { error: "Internal server error" });
  }
};
