import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

const translationDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DyanmoDBHandler.getInstance();

	const tenantId = event.pathParameters.tenantId;
	const translationKey = event.pathParameters.translationKey;

	try {
		const user = await dynamo.getItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey, "tenantId");
		if (!user) {
			return formatJSONResponse({}, 404);
		}
		await dynamo.deleteItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey);
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}
};

export const main = middyfy(authorizer(translationDelete));
