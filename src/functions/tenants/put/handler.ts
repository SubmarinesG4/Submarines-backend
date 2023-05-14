import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { Tenant } from 'src/types/Tenant';
import schema from './schema';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DyanmoDBHandler.getInstance();

	const tenantId = event.pathParameters.tenantId as string;
	const newTenant: Tenant = {
		tenantId: "TRAD#" + tenantId,
		keySort: "TENANT#" + tenantId,
		tenantName: event.body.tenantName,
		numberTranslationAvailable: event.body.numberTranslationAvailable,
		defaultTranslationLanguage: event.body.defaultTranslationLanguage,
		listAvailableLanguages: event.body.listAvailableLanguages,
		numberTranslationUsed: 0,
		token: "h32c23crn2rcn23jcry2", //! ????????
	};

	var tenant;
	try {
		tenant = await dynamo.getItem(newTenant.tenantId, newTenant.keySort, "tenantId");
		await dynamo.putItem(newTenant);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}

	return formatJSONResponse(
		{
			tenantName: newTenant.tenantName,
			numberTranslationAvailable: newTenant.numberTranslationAvailable,
			defaultTranslationLanguage: newTenant.defaultTranslationLanguage,
			listAvailableLanguages: newTenant.listAvailableLanguages,
			numberTranslationUsed: newTenant.numberTranslationUsed,
			token: newTenant.token,
			userList: []
		},
		(tenant) ? 200 : 201
	);
};

export const main = middyfy(authorizer(tenantPut));
