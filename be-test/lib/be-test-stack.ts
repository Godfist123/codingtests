import * as cdk from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class BeTestStack extends cdk.Stack {
  public readonly apiUrlOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dynamo DB table
    const paymentsTable = new Table(this, "PaymentsTable", {
      tableName: "PaymentsTable",
      partitionKey: { name: "paymentId", type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    paymentsTable.addGlobalSecondaryIndex({
      indexName: "currencyIndex",
      partitionKey: { name: "currency", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // API
    const paymentsApi = new RestApi(this, "ofxPaymentsChallenge", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });
    const paymentsResource = paymentsApi.root.addResource("payments");
    const specificPaymentResource = paymentsResource.addResource("{id}");

    // Add this Output to get API URL after deploy
    this.apiUrlOutput = new cdk.CfnOutput(this, "ApiUrl", {
      value: paymentsApi.url,
    });

    // Functions
    const createPaymentFunction = this.createLambda(
      "createPayment",
      "src/createPayment.ts"
    );
    paymentsTable.grantWriteData(createPaymentFunction);
    paymentsResource.addMethod(
      "POST",
      new LambdaIntegration(createPaymentFunction)
    );

    const getPaymentFunction = this.createLambda(
      "getPayment",
      "src/getPayment.ts"
    );
    paymentsTable.grantReadData(getPaymentFunction);
    specificPaymentResource.addMethod(
      "GET",
      new LambdaIntegration(getPaymentFunction)
    );

    const listPaymentsFunction = this.createLambda(
      "listPayments",
      "src/listPayments.ts"
    );
    paymentsTable.grantReadData(listPaymentsFunction);
    paymentsResource.addMethod(
      "GET",
      new LambdaIntegration(listPaymentsFunction)
    );
  }

  createLambda = (name: string, path: string) => {
    return new NodejsFunction(this, name, {
      functionName: name,
      runtime: Runtime.NODEJS_16_X,
      entry: path,
    });
  };
}
