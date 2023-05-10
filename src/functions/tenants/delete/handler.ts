import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { deleteItem, getItem } from 'src/services/dynamodb';

export const tenantDelete = async (event) => {
	try {

		//controllo che ci sia il tenant
		const tenant = await getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId);
		if(!tenant){
			return formatJSONResponse({}, 404);
		}
		//esiste il tenant -> delete tenant
		await deleteItem("TRAD#" + event.pathParameters.tenantId, "TENANT#"+ event.pathParameters.tenantId);		
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

export const main = middyfy(authorizer(tenantDelete));
