import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { putTenant } from 'src/services/dynamodb';
import { Tenant } from 'src/types/Tenant';
import schema from './schema';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const tenantId = event.pathParameters.tenantId as string;
	const newTenant: Tenant = {
		tenantId: "TRAD#" + tenantId,
		KeySort: "TENANT#" + tenantId,
		nomeTenant: event.body.nomeTenant,
		numeroTraduzioniDisponibili: event.body.numeroTraduzioniDisponibili,
		linguaTraduzioneDefault: event.body.linguaTraduzioneDefault,
		listaLingueDisponibili: event.body.listaLingueDisponibili,
		numeroTraduzioniUsate: 0,
		token: "",
		listaUserTenant: []
	};

	try {
		await putTenant(newTenant);
	} catch (e) {
		return formatJSONResponse(
			{
				error: e,
			},
			400
		);
	}

	return formatJSONResponse(
		{
			newTenant,
		},
		200
	);
};

export const main = middyfy(authorizer(tenantPut));
