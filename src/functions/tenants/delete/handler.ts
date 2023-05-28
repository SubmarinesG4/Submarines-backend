import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { CognitoHandler } from 'src/services/cognitoHandler';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';
import schema from './schema';

const tenantDelete: ValidatedEventAPIGatewayProxyEvent<typeof schema>  = async (event) => {
	return await logic(event.pathParameters);
};

export async function logic(pathParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();

	try {
		const tenant = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "TENANT#" + pathParameters.tenantId, "tenantId");
		if (!tenant) {
			return formatJSONResponse({}, 404);		//* Tenant not found
		}

		//elimino utenti da cognito
		(await dynamo.getTenantUsers("TRAD#" + pathParameters.tenantId)).map((i) => {
			cognito.deleteUser(i["username"]);
		});

		await dynamo.deleteTenantItems("TRAD#" + pathParameters.tenantId);
		await dynamo.deleteItem("TRAD#" + pathParameters.tenantId, "TENANT#"+ pathParameters.tenantId);
		
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, e.statusCode
		);
	}
}

export const main = middyfy(authorizer(tenantDelete, ["super-admin"]));
