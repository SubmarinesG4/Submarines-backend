import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";
import schema from "./schema";

const tenantsGetAll: ValidatedEventAPIGatewayProxyEvent<typeof schema>  = async (event) => {
	return await logic(event.queryStringParameters);
};

export async function logic(queryStringParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();

	try {
		var result: any;

		if (queryStringParameters && queryStringParameters.word)
			result = await dynamo.getAllTenants(queryStringParameters.word);
		else
			result = await dynamo.getAllTenants();

		return formatJSONResponse(
			{ tenants: result },
			200
		);
	} catch (error) {
		return formatJSONResponse(
			{ error, }, error.statusCode
		);
	}
}

export const main = middyfy(
	authorizer(tenantsGetAll, ["super-admin"])
);
