import { DocumentClient } from "./dynamodb";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export const getPayment = async (
  paymentId: string
): Promise<Payment | null> => {
  const result = await DocumentClient.send(
    new GetCommand({
      TableName: "PaymentsTable",
      Key: { paymentId },
    })
  );

  return (result.Item as Payment) || null;
};

export const listPayments = async (): Promise<Payment[]> => {
  const result = await DocumentClient.send(
    new ScanCommand({
      TableName: "PaymentsTable",
    })
  );

  return (result.Items as Payment[]) || [];
};

export const listPaymentsByCurrency = async (
  currency: string
): Promise<Payment[]> => {
  const result = await DocumentClient.send(
    new QueryCommand({
      TableName: "PaymentsTable",
      IndexName: "currencyIndex",
      KeyConditionExpression: "currency = :currency",
      ExpressionAttributeValues: {
        ":currency": currency,
      },
    })
  );
  return (result.Items as Payment[]) || [];
};

export const createPayment = async (payment: Payment) => {
  await DocumentClient.send(
    new PutCommand({
      TableName: "PaymentsTable",
      Item: {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
      },
    })
  );
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
};
