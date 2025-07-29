import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getPayment } from "./lib/payments";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Extract payment ID from path parameters
  const paymentId = event.pathParameters?.id;

  if (!paymentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Payment ID is required" }),
    };
  }

  try {
    // Retrieve payment from DynamoDB
    const payment = await getPayment(paymentId);

    if (!payment) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Payment not found" }),
      };
    }

    // Return the payment data to the user
    return {
      statusCode: 200,
      body: JSON.stringify(payment),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
