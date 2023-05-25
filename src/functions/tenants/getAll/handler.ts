import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const tenantsGetAll = async (event) => {

	const dynamo = DynamoDBHandler.getInstance();

	try {
		var result: any;

		if (event.queryStringParameters && event.queryStringParameters.word)
			result = await dynamo.getAllTenants(event.queryStringParameters.word);
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
};

export const main = middyfy(
	authorizer(tenantsGetAll, ["super-admin"])
);
