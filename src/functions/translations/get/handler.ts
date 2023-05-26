import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";
import schema from "./schema";

const translationGet: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	return await logic(event.pathParameters);
};

export async function logic (pathParameters: any) {
	const tenantId = pathParameters.tenantId as string;
	const translationKey = pathParameters.translationKey as string;

	const dynamo = DynamoDBHandler.getInstance();

	try {
		const translation = await dynamo.getItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey, "defaultTranslationLanguage, defaultTranslationinLanguage, translations, creationDate, modificationDate, modifiedbyUser, published, versionedTranslations, translationKey");
		if (!translation) {
			return formatJSONResponse({error: "Tenant not found"}, 404);
		}
		return formatJSONResponse(translation, 200);
	} catch (error) {
		return formatJSONResponse(
			{ error }, error.statusCode
		);
	}
}

export const main = middyfy(
	authorizer(translationGet, ["super-admin", "admin", "traduttore"])
);
