import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const tenantPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DynamoDBHandler.getInstance();

	if (!event.body.listAvailableLanguages && !event.body.defaultTranslationLanguage && !event.body.numberTranslationAvailable) {
		return formatJSONResponse(
			{ error: "Nothing to update" }, 400
		);
	}

	var old: any;
	try {
		old = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId, "tenantId, keySort, tenantName, numberTranslationAvailable, defaultTranslationLanguage, listAvailableLanguages, #tk", true);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, e.statusCode
		);
	}

	if (!old) {
		return formatJSONResponse(
			{ error: "Tenant not found" }, 404
		);
	}

	if (event.body.numberTranslationAvailable)
		old.numberTranslationAvailable = event.body.numberTranslationAvailable;

	if (event.body.listAvailableLanguages) {
		//* Controlla se ci sono lingue ripetute in listAvailableLanguages
		if ((new Set(event.body.listAvailableLanguages)).size !== event.body.listAvailableLanguages.length)
			return formatJSONResponse(
				{ error: "listAvailableLanguages must not contain duplicates" }, 400
			);
		old.listAvailableLanguages = event.body.listAvailableLanguages;
	}

	if (event.body.defaultTranslationLanguage) {
		//* Controlla se la lingua di default è tra quelle disponibili
		if (!event.body.listAvailableLanguages.includes(event.body.defaultTranslationLanguage))
			return formatJSONResponse(
				{ error: "defaultTranslationLanguage must be in listAvailableLanguages" }, 400
			);
		old.defaultTranslationLanguage = event.body.defaultTranslationLanguage;
	}

	try {
		await dynamo.putItem(old);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, e.statusCode
		);
	}
	
	return formatJSONResponse(
		{
			tenantName: old.tenantName,
			numberTranslationAvailable: old.numberTranslationAvailable,
			defaultTranslationLanguage: old.defaultTranslationLanguage,
			listAvailableLanguages: old.listAvailableLanguages,
			numberTranslationUsed: (await dynamo.getAllTranslations(old.tenantId)).length,
			token: old.token,
			users: await dynamo.getTenantUsers(old.tenantId),
		},
		200
	);
};

export const main = middyfy(authorizer(tenantPut, ["super-admin"]));
