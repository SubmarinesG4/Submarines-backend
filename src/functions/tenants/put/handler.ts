import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { Tenant } from 'src/types/Tenant';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DynamoDBHandler.getInstance();

	const tenantId = event.pathParameters.tenantId as string;
	const newTenant: Tenant = {
		tenantId: "TRAD#" + tenantId,
		keySort: "TENANT#" + tenantId,
		tenantName: event.body.tenantName,
		numberTranslationAvailable: event.body.numberTranslationAvailable,
		defaultTranslationLanguage: event.body.defaultTranslationLanguage,
		listAvailableLanguages: event.body.listAvailableLanguages,
		token: "token1", //! ????????
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
	var users = [];
	try {
		tenant = await dynamo.getItem(newTenant.tenantId, newTenant.keySort, "tenantId");
		if (tenant) {
			users = await dynamo.getTenantUsers(tenant.tenantId);
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
			numberTranslationUsed: (await dynamo.getAllTranslations(newTenant.tenantId)).length,
			token: newTenant.token,
			userList: users
		},
		(tenant) ? 200 : 201
	);
};

export const main = middyfy(authorizer(tenantPut, ["super-admin"]));
