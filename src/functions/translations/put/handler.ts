import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import { Translation, Version } from 'src/types/Translation';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';

const tranlsationPut: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	let newTranslation: Translation = {
		tenantId: "TRAD#" + event.pathParameters.tenantId,
		keySort: "TRAD#" + event.pathParameters.tenantId + "#" + event.pathParameters.translationKey,
		translationKey: event.pathParameters.translationKey,
		defaultTranslationLanguage: event.body.defaultTranslationLanguage,
		defaultTranslationinLanguage: event.body.defaultTranslationinLanguage,
		translations: event.body.translations,
		creationDate: new Date().toISOString(),
		modificationDate: new Date().toISOString(),
		modifiedbyUser: event.body.modifiedbyUser,
		published: event.body.published,
		versionedTranslations: []
	}
	const newVersion: Version = {
		modificationDate: newTranslation.creationDate,
		modifiedbyUser: newTranslation.modifiedbyUser,
		translations: newTranslation.translations,
		published: newTranslation.published
	};

	const dynamo = DynamoDBHandler.getInstance();

	var translationLimit: number;

	//* Controlla se esiste il tenant
	try {
		const tenant = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId, "tenantId, numberTranslationAvailable");
		translationLimit = tenant.numberTranslationAvailable;
		if (!tenant) {
			return formatJSONResponse({ error: "Tenant not found" }, 400);
		}
	} catch (e) {
		return formatJSONResponse({ error: e }, e.statusCode);
	}

	//* Controlla se esiste l'utente
	try {
		const user = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.modifiedbyUser, "tenantId");
		if (!user) {
			return formatJSONResponse({ error: "User not found" }, 400);
		}
	} catch (e) {
		return formatJSONResponse({ error: e }, e.statusCode);
	}

	let jsonTranslation;
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
			if ((await dynamo.getAllTranslations(newTranslation.tenantId)).length + 1 >= translationLimit)
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
};

export const main = middyfy(authorizer(tranlsationPut, ["super-admin", "admin", "traduttore"]));
