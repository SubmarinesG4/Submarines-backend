import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer, testAuth } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";
import schema from "./schema";

const getTenant: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if(testAuth(event.requestContext.authorizer.claims,event.pathParameters))
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
	const tenantId = pathParameters.tenantId;
	const dynamo = DynamoDBHandler.getInstance();

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
			numberTranslationUsed: (await dynamo.getAllTranslations("TRAD#" + tenantId)).length,
			defaultTranslationLanguage: response.defaultTranslationLanguage,
			listAvailableLanguages: response.listAvailableLanguages,
			token: response.token,
			userList: users
		},
		200
	);
};

export const main = middyfy(
	authorizer(getTenant, ["super-admin", "admin", "traduttore"])
);
