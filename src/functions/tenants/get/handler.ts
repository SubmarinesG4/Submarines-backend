import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { getItem } from "src/services/dynamodb";
import { Tenant } from "src/types/Tenant";

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
	console.log(tenant);
	//! COME FARE PER LA LISTA DEGLI USER? NON HA SENSO API PUT CHE DA LA LISTA DI USER VISTO CHE NON C'E'
	const response: Tenant = {
		tenantId: tenant.tenantId,
		KeySort: tenant.KeySort,
		nomeTenant: tenant.nomeTenant,
		numeroTraduzioniDisponibili: tenant.numeroTraduzioniDisponibili,
		numeroTraduzioniUsate: tenant.numeroTraduzioniUsate,
		linguaTraduzioneDefault: tenant.linguaTraduzioneDefault,
		listaLingueDisponibili: tenant.listaLingueDisponibili,
		token: tenant.token,
		listaUserTenant: tenant.listaUserTenant
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
