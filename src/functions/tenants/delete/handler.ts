import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { CognitoHandler } from 'src/services/cognitoHandler';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

export const tenantDelete = async (event) => {

	const dynamo = DyanmoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();

	try {
		const tenant = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId, "tenantId");
		if (!tenant) {
			return formatJSONResponse({}, 404);		//* Tenant not found
		}

		//elimino utenti da cognito
		console.log("inizio a cancellare cognito");
		var a = await dynamo.getTenantUsers(event.pathParameters.tenantId);
		console.log(a);
		/*(await dynamo.getTenantUsers(event.pathParameters.tenantId)).map((i) => {
			console.log("cancello cognito utente: "+ i["username"]);
			cognito.deleteUser(i["username"]);
		});*/
		console.log("FINE cancellare cognito");

		
		await dynamo.deleteTenantItems("TRAD#" + event.pathParameters.tenantId);
		await dynamo.deleteItem("TRAD#" + event.pathParameters.tenantId, "TENANT#"+ event.pathParameters.tenantId);
		
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}
};

export const main = middyfy(authorizer(tenantDelete));
