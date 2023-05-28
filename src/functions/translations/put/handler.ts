import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer, testAuth } from 'src/middleware/validators';
import { Translation, Version } from 'src/types/Translation';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const tranlsationPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if (testAuth(event.requestContext.authorizer.claims, event.pathParameters) || event.userRoles.includes("super-admin"))
		return await logic(event.body, event.pathParameters);
	else
		return formatJSONResponse(
			{
				message: "User has not got the required role for this action",
			},
			403
		);
};

export async function logic(body: any, pathParameters: any) {
	const dataCreazione: string = new Date().toISOString();
	let newTranslation: Translation = {
		tenantId: "TRAD#" + pathParameters.tenantId,
		keySort: "TRAD#" + pathParameters.tenantId + "#" + pathParameters.translationKey,
		translationKey: pathParameters.translationKey,
		defaultTranslationLanguage: body.defaultTranslationLanguage,
		defaultTranslationinLanguage: body.defaultTranslationinLanguage,
		translations: body.translations,
		creationDate: dataCreazione,
		modificationDate: dataCreazione,
		modifiedbyUser: body.modifiedbyUser,
		published: body.published,
		versionedTranslations: []
	}
	const newVersion: Version = {
		modificationDate: newTranslation.creationDate,
		modifiedbyUser: newTranslation.modifiedbyUser,
		translations: newTranslation.translations,
		published: newTranslation.published
	};

	//* Controlla che ci sia la lingua di default in translations
	var flag = false;
	for (var i = 0; i < newTranslation.translations.length; i++)
		if (newTranslation.translations[i].language == newTranslation.defaultTranslationLanguage)
			flag = true;
	if (!flag)
		return formatJSONResponse({ error: "defaultTranslationLanguage must be in translations" }, 400);

	//* Controllare che non ci siano duplicati di language dentro translations
	var languages: Array<string> = [];
	for (var i = 0; i < newTranslation.translations.length; i++)
		languages.push(newTranslation.translations[i].language);
	if ((new Set(languages)).size !== languages.length)
		return formatJSONResponse({ error: "translations must not contain duplicates" }, 400);

	const dynamo = DynamoDBHandler.getInstance();

	var translationLimit: number;

	//* Controlla: 
	//* se esiste il tenant
	//* se la lingua di default è corretta
	//* se tutte le lingue di traduzione sono presenti tra le disponibili del tenant
	try {

		const tenant = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "TENANT#" + pathParameters.tenantId, "tenantId, numberTranslationAvailable, listAvailableLanguages, defaultTranslationLanguage");
		translationLimit = tenant.numberTranslationAvailable;
		if (!tenant)
			return formatJSONResponse({ error: "Tenant not found" }, 400);
		if (tenant.defaultTranslationLanguage != newTranslation.defaultTranslationLanguage)
			return formatJSONResponse({ error: "DefaultTranslationLanguage is not correct" }, 400);
		for (var i = 0; i < newTranslation.translations.length; i++) {
			if (!tenant.listAvailableLanguages.includes(newTranslation.translations[i].language)) {
				return formatJSONResponse({ error: "Language " + newTranslation.translations[i].language + " is not available" }, 400);
			}
		}

	} catch (e) {
		return formatJSONResponse({ error: "Tenant not found" }, 400);
	}

	//* Controlla se esiste l'utente
	try {
		const user = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "USER#" + body.modifiedbyUser, "tenantId");
		if (!user) {
			return formatJSONResponse({ error: "User not found" }, 400);
		}
	} catch (e) {
		return formatJSONResponse({ error: e }, e.statusCode);
	}

	let jsonTranslation: any;
	try {

		let versions: Array<Version> = [];

		//* Controlla se esiste già la traduzione (cioè è da modificare)
		jsonTranslation = await dynamo.getItem(newTranslation.tenantId, newTranslation.keySort, "versionedTranslations, creationDate");
		if (jsonTranslation != undefined) {
			const old = await <Translation>JSON.parse(JSON.stringify(jsonTranslation));		//* Vecchio oggetto
			newTranslation.creationDate = old.creationDate;								//* La data di creazione non cambia
			versions = old.versionedTranslations;									//* Prende le versioni precedenti
			if (versions.length == 5)												//* Se sono 5 elimina la più vecchia (prima nell'array)
				versions.shift();
		} else {
			if ((await dynamo.getAllTranslations(newTranslation.tenantId)).length + 1 > translationLimit)
				return formatJSONResponse({ error: "Translation limit reached" }, 400);
		}
		versions.push(newVersion);													//* Aggiunge la nuova versione
		newTranslation.versionedTranslations = versions;							//* Aggiorna l'oggetto

		await dynamo.putItem(newTranslation);
	} catch (e) {
		return formatJSONResponse({ error: e }, e.statusCode);
	}

	return formatJSONResponse({
		translationKey: newTranslation.translationKey,
		defaultTranslationLanguage: newTranslation.defaultTranslationLanguage,
		defaultTranslationinLanguage: newTranslation.defaultTranslationinLanguage,
		translations: newTranslation.translations,
		creationDate: newTranslation.creationDate,
		modificationDate: newTranslation.modificationDate,
		modifiedbyUser: newTranslation.modifiedbyUser,
		published: newTranslation.published,
		versionedTranslations: newTranslation.versionedTranslations
	}, jsonTranslation ? 200 : 201);
}

export const main = middyfy(authorizer(tranlsationPut, ["super-admin", "admin", "traduttore"]));
