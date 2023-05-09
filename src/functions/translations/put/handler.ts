import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { putTranslation } from 'src/services/dynamodb';
import { Translation } from 'src/types/Translation';
import schema from './schema';

const tranlsationPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const tenantId = event.pathParameters.tenantId as string;
	const keyTraduzione = event.pathParameters.keyTraduzione as string;
	const newTranslation: Translation = {
		tenantId: "TRAD#" + tenantId,
		keySort: "TRAD#" + tenantId + "#" + keyTraduzione,
		linguaTraduzioneDefault: event.body.linguaTraduzioneDefault,
		traduzioneinLinguaDefault: event.body.traduzioneinLinguaDefault,
		traduzioni: event.body.traduzioni,
		modificatodaUtente: event.body.modificatodaUtente,
		dataCreazione: new Date().toISOString(),
		dataModifica: new Date().toISOString(),
		pubblicato: event.body.pubblicato,
	};

	try {
		await putTranslation(newTranslation);
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
			newTranslation,
		},
		200
	);
};

export const main = middyfy(authorizer(tranlsationPut));
