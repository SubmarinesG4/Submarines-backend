import { formatJSONResponse/*, ValidatedEventAPIGatewayProxyEvent */} from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { deleteTenant, getItem } from 'src/services/dynamodb';
//import schema from './schema';

export const tenantDelete = async (event) => {
	try {

		//controllo che ci sia il tenant
		const tenant = await getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId);
		if(!tenant){
			return formatJSONResponse({
				"response": "Tenant not found, eliminazione fallita"
			}, 404);
		}
		//esiste il tenant -> delete tenant
		await deleteTenant("TRAD#" + event.pathParameters.tenantId, "TENANT#"+ event.pathParameters.tenantId);		
		return formatJSONResponse(
				{
					response: "Tenant eliminato con successo"
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

export const main = middyfy(authorizer(tenantDelete));
