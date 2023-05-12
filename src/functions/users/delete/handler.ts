import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

const userDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DyanmoDBHandler.getInstance();

	try {
		const user = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.userEmail);
		if (!user) {
			return formatJSONResponse({}, 404);
		}
		await dynamo.deleteItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.userEmail);
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{
				error: e,
			},
			400
		);
	}
};

export const main = middyfy(authorizer(userDelete));
