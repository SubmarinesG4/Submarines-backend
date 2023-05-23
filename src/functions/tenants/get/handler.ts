import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DyanmoDBHandler } from "src/services/dynamoDBHandler";

export const getTenant = async (event) => {
	const tenantId = event.pathParameters.tenantId;
	const dynamo = DyanmoDBHandler.getInstance();

	//* GET TENANT INFO
	var response;
	try {
		const projectionExpression = "tenantName, numberTranslationAvailable, numberTranslationUsed, defaultTranslationLanguage, listAvailableLanguages, #tk";
		response = await dynamo.getItem("TRAD#" + tenantId, "TENANT#" + tenantId, projectionExpression, true);
		if (!response) {
			return formatJSONResponse({}, 404);
		}
	} catch (error) {
		return formatJSONResponse(
			{ error }, error.statusCode
		);
	}

	//* GET USERS
	var users;
	try {
		users = await dynamo.getTenantUsers("TRAD#" + tenantId);
	} catch (error) {
		console.log("Error", error.stack);
	}

	//* CREATE AND RETURN OBJECT
	return formatJSONResponse (
		{
			tenantName: response.tenantName,
			numberTranslationAvailable: response.numberTranslationAvailable,
			numberTranslationUsed: response.numberTranslationUsed,
			defaultTranslationLanguage: response.defaultTranslationLanguage,
			listAvailableLanguages: response.listAvailableLanguages,
			token: response.token,
			userList: users
		},
		200
	);
};

export const main = middyfy(
	authorizer(getTenant)
);
