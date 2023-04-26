import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { putTenant } from 'src/services/dynamodb';
import { Tenant } from 'src/types/Tenant';
import schema from './schema';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async ({
	body,
}) => {
	const newTenant: Tenant = {
		tenantId: "TRAD#"+body.tenantId,
		KeySort: "TENANT#"+body.tenantId,
		nomeTenant: body.nomeTenant,
		numeroTraduzioniDisponibili: body.numeroTraduzioniDisponibili,
		linguaTraduzioneDefault: body.linguaTraduzioneDefault,
		listaLingueDisponibili: body.listaLingueDisponibili,
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
			500
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
