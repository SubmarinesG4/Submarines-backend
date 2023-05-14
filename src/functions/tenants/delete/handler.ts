import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

export const tenantDelete = async (event) => {

	const dynamo = DyanmoDBHandler.getInstance();

	try {
		const tenant = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId, "tenantId");
		if (!tenant) {
			return formatJSONResponse({}, 404);		//* Tenant not found
		}
		
		await dynamo.deleteItem("TRAD#" + event.pathParameters.tenantId, "TENANT#"+ event.pathParameters.tenantId);		
		return formatJSONResponse({}, 200);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}
};

export const main = middyfy(authorizer(tenantDelete));
