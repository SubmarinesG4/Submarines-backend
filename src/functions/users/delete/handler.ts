import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { deleteItem, getItem } from 'src/services/dynamodb';
import schema from './schema';

const userDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		const user = await getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.userEmail);
		if (!user) {
			return formatJSONResponse({}, 404);
		}
		await deleteItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.userEmail);
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
