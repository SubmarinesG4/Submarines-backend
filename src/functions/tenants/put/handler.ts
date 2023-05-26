import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { Tenant } from 'src/types/Tenant';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	return await logic(event.body, event.pathParameters);
};

export async function logic(body: any, pathParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();
	const getUuid = require('uuid-by-string');

	const tenantId = pathParameters.tenantId as string;
	const newTenant: Tenant = {
		tenantId: "TRAD#" + tenantId,
		keySort: "TENANT#" + tenantId,
		tenantName: tenantId,
		numberTranslationAvailable: body.numberTranslationAvailable,
		defaultTranslationLanguage: body.defaultTranslationLanguage,
		listAvailableLanguages: body.listAvailableLanguages,
		token: getUuid(tenantId)
	};

	//* Controlla se la lingua di default è tra quelle disponibili
	if (!newTenant.listAvailableLanguages.includes(newTenant.defaultTranslationLanguage))
		return formatJSONResponse(
			{ error: "defaultTranslationLanguage must be in listAvailableLanguages" }, 400
		);

	//* Controlla se ci sono lingue ripetute in listAvailableLanguages
	if ((new Set(newTenant.listAvailableLanguages)).size !== newTenant.listAvailableLanguages.length)
		return formatJSONResponse(
			{ error: "listAvailableLanguages must not contain duplicates" }, 400
		);

	var tenant;
	try {
		tenant = await dynamo.getItem(newTenant.tenantId, newTenant.keySort, "tenantId");
		if (tenant) {
			return formatJSONResponse(
				{ error: "Tenant already exists" }, 400
			);
		}
		await dynamo.putItem(newTenant);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, e.statusCode
		);
	}

	return formatJSONResponse(
		{
			tenantName: newTenant.tenantName,
			numberTranslationAvailable: newTenant.numberTranslationAvailable,
			defaultTranslationLanguage: newTenant.defaultTranslationLanguage,
			listAvailableLanguages: newTenant.listAvailableLanguages,
			numberTranslationUsed: 0,
			token: newTenant.token,
			userList: []
		},
		201
	);
}

export const main = middyfy(authorizer(tenantPut, ["super-admin"]));
