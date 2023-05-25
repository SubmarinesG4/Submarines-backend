import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const updateTenant: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	return logic(event.body, event.pathParameters);
};

export async function logic (body: any, pathParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();

	if (!body.listAvailableLanguages && !body.defaultTranslationLanguage && !body.numberTranslationAvailable) {
		return formatJSONResponse(
			{ error: "Nothing to update" }, 400
		);
	}

	var old: any;
	try {
		old = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "TENANT#" + pathParameters.tenantId, "tenantId, keySort, tenantName, numberTranslationAvailable, defaultTranslationLanguage, listAvailableLanguages, #tk", true);
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

	if (body.numberTranslationAvailable)
		old.numberTranslationAvailable = body.numberTranslationAvailable;

	if (body.listAvailableLanguages) {
		//* Controlla se ci sono lingue ripetute in listAvailableLanguages
		if ((new Set(body.listAvailableLanguages)).size !== body.listAvailableLanguages.length)
			return formatJSONResponse(
				{ error: "listAvailableLanguages must not contain duplicates" }, 400
			);
		old.listAvailableLanguages = body.listAvailableLanguages;
	}

	if (body.defaultTranslationLanguage) {
		//* Controlla se la lingua di default è tra quelle disponibili
		if (!body.listAvailableLanguages.includes(body.defaultTranslationLanguage))
			return formatJSONResponse(
				{ error: "defaultTranslationLanguage must be in listAvailableLanguages" }, 400
			);
		old.defaultTranslationLanguage = body.defaultTranslationLanguage;
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
}

export const main = middyfy(authorizer(updateTenant, ["super-admin"]));
