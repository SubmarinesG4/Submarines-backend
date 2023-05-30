import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer, testAuth } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";
import schema from "./schema";

const translationGetAll: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if (testAuth(event.requestContext.authorizer.claims, event.pathParameters) || event.userRoles.includes("super-admin"))
		return logic(event.pathParameters, event.queryStringParameters);
	else
		return formatJSONResponse(
			{
				message: "User has not got the required role for this action",
			},
			403
		);
};

export async function logic(pathParameters: any, queryStringParameters: any) {
	const tenantId: string = pathParameters.tenantId as string;
	const dynamo = DynamoDBHandler.getInstance();

	try {
		var translations: any;

		//* Se ci sono parametri nella query string devo filtrare
		if (queryStringParameters) {
			//* Controllo che published sia true o false
			if (queryStringParameters.published && queryStringParameters.published != "true" && queryStringParameters.published != "false")
				return formatJSONResponse(
					{ error: "published must be true or false" }, 400
				);

			translations = await dynamo.getScannedTranslations("TRAD#" + tenantId, queryStringParameters);

		} else {
			translations = await dynamo.getAllTranslations("TRAD#" + tenantId);
		}

		return formatJSONResponse(
			{ translations }, 200
		);
	} catch (error) {
		return formatJSONResponse(
			error, 500
		);
	}
}

export const main = middyfy(
	authorizer(translationGetAll, ["super-admin", "admin", "traduttore"])
);
