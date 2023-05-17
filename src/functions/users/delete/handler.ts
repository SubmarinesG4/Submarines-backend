import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';
import { CognitoHandler } from 'src/services/cognitoHandler';

const userDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DyanmoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();

	var user: any;

	try {
		user = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.username, "tenantId");
		const cognitoUser: any = cognito.getUser(event.body.username);
		if (!user || !cognitoUser) {
			return formatJSONResponse({}, 404);
		}
		cognito.deleteUser(event.body.username);
		await dynamo.deleteItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.username);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}

	return formatJSONResponse({}, 200);
};

export const main = middyfy(authorizer(userDelete));
