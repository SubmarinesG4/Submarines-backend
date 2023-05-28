import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";
import schema from "./schema";

const translationGetAll: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	return await logic(event.pathParameters);
};

export async function logic(pathParameters: any) {
	const dynamo = DynamoDBHandler.getInstance();

	const language = pathParameters.language as string;
	const token = pathParameters.token as string;

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

	//? Controllo che la lingua sia disponibile
	if (!tenant.listAvailableLanguages.includes(language)) {
		return formatJSONResponse(
			{ error: "Lingua non disponibile" }, 404
		);
	}

	//? Ricerca delle traduzioni
	try {
		const list = await dynamo.getAllTranslations(tenant.tenantId, "translations, published, translationKey")
		const translations: Map<string, string> = new Map();

		for (var i = 0; i < list.length; i++) {
			if (list[i].published == true) {
				for (var j = 0; j < list[i].translations.length; j++) {
					if (list[i].translations[j].language == language) {
						translations[list[i].translationKey] = list[i].translations[j].content;
					}
				}
			}
		}

		return formatJSONResponse(
			{
				translations
			}, 200
		);
	} catch (e) {
		console.log(e);
		throw e;
	}

};

export const main = middyfy(
	translationGetAll
);
