import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer, testAuth } from 'src/middleware/validators';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const translationDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if(testAuth(event.requestContext.authorizer.claims,event.pathParameters))
		return await logic(event.pathParameters);
	else
		return formatJSONResponse(
			{
				message: "User has not got the required role for this action from handler",
			},
			403
		);
};

export async function logic (pathParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();

	const tenantId = pathParameters.tenantId;
	const translationKey = pathParameters.translationKey;

	try {
		const user = await dynamo.getItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey, "tenantId");
		if (!user) {
			return formatJSONResponse({ error: "Tenant not found"}, 404);
		}
		await dynamo.deleteItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey);
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, e.statusCode
		);
	}
}

export const main = middyfy(authorizer(translationDelete, ["super-admin", "admin", "traduttore"]));
