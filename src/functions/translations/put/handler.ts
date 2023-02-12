import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { putTranslation } from 'src/services/dynamodb';
import { Translation } from 'src/types/Translation';
import schema from './schema';

const tranlsationPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async ({
	body,
}) => {
	const newTranslation: Translation = {
		projectId: body.projectId,
		translationKey: body.translationKey,
		languages: body.languages
	};

	try {
		await putTranslation(newTranslation);
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
			newTranslation,
		},
		200
	);
};

export const main = middyfy(authorizer(tranlsationPut));
