import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const translationGet = async (event) => {
	
	const tenantId = event.pathParameters.tenantId as string;
	const translationKey = event.pathParameters.translationKey as string;

	const dynamo = DynamoDBHandler.getInstance();

	try {
		const translation = await dynamo.getItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey, "defaultTranslationLanguage, defaultTranslationinLanguage, translations, creationDate, modificationDate, modifiedbyUser, published, versionedTranslations, translationKey");
		if (!translation) {
			return formatJSONResponse({}, 404);
		}
		return formatJSONResponse(translation, 200);
	} catch (error) {
		return formatJSONResponse(
			{ error }, error.statusCode
		);
	}
};

export const main = middyfy(
	authorizer(translationGet, ["super-admin", "admin", "traduttore"])
);
