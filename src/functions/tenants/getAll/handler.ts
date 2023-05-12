import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DyanmoDBHandler } from "src/services/dynamoDBHandler";

const tenantsGetAll = async () => {

	const dynamo = DyanmoDBHandler.getInstance();

	try {
		const result = await dynamo.getAllTenants();
		return formatJSONResponse(
			{ tenants: result },
			200
		);
	} catch (error) {
		return formatJSONResponse(
			{
				error,
			},
			400
		);
	}
};

export const main = middyfy(
	authorizer(tenantsGetAll)
);
