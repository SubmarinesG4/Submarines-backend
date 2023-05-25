import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const getLibraryTenantLanguages = async (event) => {

	const dynamo = DynamoDBHandler.getInstance();

	const token = event.pathParameters.token as string;

	var tenant;
	//? Ricerca del tenant corrispondente al token
	try {
		const response = await dynamo.getTenantByToken(token);
		if (response.length != 1) {
			return formatJSONResponse(
				{ error: "Token non valido" }, 400
			);
		}
		tenant = response[0];
	} catch (e) {
		console.log(e);
		throw e;
	}

	try {
		//? Ottengo lista delle lingue
		if (!tenant.listAvailableLanguages || !tenant.defaultTranslationLanguage) {
			return formatJSONResponse(
				{ error: "Lingue non disponibili" }, 404
			);
		}

		return formatJSONResponse(
			{ 
				defaultLanguage: tenant.defaultTranslationLanguage,
				languages: tenant.listAvailableLanguages
			}, 200
		);
	} catch (e) {
		console.log(e);
		throw e;
	}

	
};

export const main = middyfy(
	authorizer(getLibraryTenantLanguages, ["super-admin", "admin", "traduttore"])
);