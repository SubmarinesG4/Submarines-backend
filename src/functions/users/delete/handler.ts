import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer, testAuth } from 'src/middleware/validators';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';
import { CognitoHandler } from 'src/services/cognitoHandler';

const userDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if (testAuth(event.requestContext.authorizer.claims, event.pathParameters) || event.userRoles.includes("super-admin"))
		return await logic(event.body, event.pathParameters);
	else
		return formatJSONResponse(
			{
				message: "User has not got the required role for this action",
			},
			403
		);
};

export async function logic(body: any, pathParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();

	var user: any;

	try {
		user = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "USER#" + body.username, "tenantId");
		const cognitoUser: any = await cognito.getUser(body.username);
		if (!user || !cognitoUser) {
			return formatJSONResponse({ error: "User not found" }, 404);
		}
		cognito.deleteUser(body.username);
		await dynamo.deleteItem("TRAD#" + pathParameters.tenantId, "USER#" + body.username);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 500
		);
	}

	return formatJSONResponse({}, 200);
}

export const main = middyfy(authorizer(userDelete, ["super-admin", "admin"]));
