import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { CognitoHandler } from 'src/services/cognitoHandler';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

export const tenantDelete = async (event) => {

	const dynamo = DynamoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();

	try {
		const tenant = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId, "tenantId");
		if (!tenant) {
			return formatJSONResponse({}, 404);		//* Tenant not found
		}

		//elimino utenti da cognito
		(await dynamo.getTenantUsers("TRAD#" + event.pathParameters.tenantId)).map((i) => {
			console.log("cancello cognito utente: "+ i["username"]);
			cognito.deleteUser(i["username"]);
		});

		await dynamo.deleteTenantItems("TRAD#" + event.pathParameters.tenantId);
		await dynamo.deleteItem("TRAD#" + event.pathParameters.tenantId, "TENANT#"+ event.pathParameters.tenantId);
		
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, e.statusCode
		);
	}
};

export const main = middyfy(authorizer(tenantDelete, ["super-admin"]));
