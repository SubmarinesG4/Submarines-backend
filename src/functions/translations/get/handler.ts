import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer, testAuth } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";
import schema from "./schema";

const translationGet: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if (testAuth(event.requestContext.authorizer.claims, event.pathParameters) || event.userRoles.includes("super-admin"))
		return await logic(event.pathParameters);
	else
		return formatJSONResponse(
			{
				message: "User has not got the required role for this action",
			},
			403
		);
};

export async function logic(pathParameters: any) {
	const tenantId = pathParameters.tenantId as string;
	const translationKey = pathParameters.translationKey as string;

	const dynamo = DynamoDBHandler.getInstance();

	try {
		const translation = await dynamo.getItem("TRAD#" + tenantId, "TRAD#" + tenantId + "#" + translationKey, "defaultTranslationLanguage, defaultTranslationinLanguage, translations, creationDate, modificationDate, modifiedbyUser, published, versionedTranslations, translationKey");
		if (!translation) {
			return formatJSONResponse({ error: "Translation not found" }, 404);
		}
		return formatJSONResponse(translation, 200);
	} catch (error) {
		return formatJSONResponse(
			{ error }, 500
		);
	}
}

export const main = middyfy(
	authorizer(translationGet, ["super-admin", "admin", "traduttore"])
);
