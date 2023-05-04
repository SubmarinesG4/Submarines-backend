import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { getItem, getTenantUsers } from "src/services/dynamodb";

const getTenant = async (event) => {
	const tenantId = event.pathParameters.tenantId;

	var tenant;
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
	
	const response = {
		tenantId: tenant.tenantId,
		KeySort: tenant.KeySort,
		nomeTenant: tenant.nomeTenant,
		numeroTraduzioniDisponibili: tenant.numeroTraduzioniDisponibili,
		numeroTraduzioniUsate: tenant.numeroTraduzioniUsate,
		linguaTraduzioneDefault: tenant.linguaTraduzioneDefault,
		listaLingueDisponibili: tenant.listaLingueDisponibili,
		token: tenant.token,
		listaUtenti: users
	}
	
	return formatJSONResponse (
		{
			"tenant": response
		},
		200
	);
};

export const main = middyfy(
	authorizer(getTenant)
);
