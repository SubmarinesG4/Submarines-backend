import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { deleteUser } from 'src/services/dynamodb';
import schema from './schema';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		const response = await deleteUser("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.KeySort);
		return formatJSONResponse(
				{
					response
				},
				200
			);
	} catch (e) {
		return formatJSONResponse(
			{
				error: e,
			},
			400
		);
	}
};

export const main = middyfy(authorizer(tenantPut));
