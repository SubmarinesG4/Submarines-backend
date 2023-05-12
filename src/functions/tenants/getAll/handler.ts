import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { getAllTenants } from "src/services/dynamodb";

const tenantsGetAll = async () => {
	try {
		const result = await getAllTenants()
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
