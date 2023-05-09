import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { putTenant } from 'src/services/dynamodb';
import { Tenant } from 'src/types/Tenant';
import schema from './schema';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
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

	try {
		await putTenant(newTenant);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}

	return formatJSONResponse(
		{
			tenant: {
				tenantName: newTenant.tenantName,
				numberTranslationAvailable: newTenant.numberTranslationAvailable,
				numberTranslationUsed: newTenant.numberTranslationUsed,
				defaultTranslationLanguage: newTenant.defaultTranslationLanguage,
				listAvailableLanguages: newTenant.listAvailableLanguages,
				token: newTenant.token,
			},
		},
		201
	);
};

export const main = middyfy(authorizer(tenantPut));
