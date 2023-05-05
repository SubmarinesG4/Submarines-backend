import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";

import { getItem, getTenantUsers } from "src/services/dynamodb";

export const getTenant = async (event) => {
	const tenantId = event.pathParameters.tenantId;

	var tenant;//: Record<string, any> = {};
	try {
		tenant = await getItem("TRAD#" + tenantId, "TENANT#" + tenantId);
		if (!tenant) {
			return formatJSONResponse({
				"message": "Tenant not found"
			}, 404);
		}
	} catch (error) {
		return formatJSONResponse(
			{
				error,
			},
			400
		);
	}
	var users;
	try {
		users = await getTenantUsers("TRAD#" + tenantId);
	} catch (error) {
		console.log("Error", error.stack);
	}
	//aggiungo la lista utenti
	tenant.listaUtenti = users;	
	return formatJSONResponse (
		tenant,	
		200
	);
};

export const main = middyfy(
	authorizer(getTenant)
);
