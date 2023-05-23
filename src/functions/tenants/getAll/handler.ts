import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const tenantsGetAll = async () => {

	const dynamo = DynamoDBHandler.getInstance();

	try {
		const result = await dynamo.getAllTenants();
		if (result.length === 0)
			return formatJSONResponse(
				{}, 404
			);
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
