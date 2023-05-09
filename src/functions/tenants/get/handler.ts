import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { getItem, getTenantUsers } from "src/services/dynamodb";
import { User } from "src/types/User";

export const getTenant = async (event) => {
	const tenantId = event.pathParameters.tenantId;

	//* GET TENANT INFO
	var response;
	try {
		response = await getItem("TRAD#" + tenantId, "TENANT#" + tenantId);
		if (!response) {
			return formatJSONResponse({}, 404);
		}
	} catch (error) {
		return formatJSONResponse(
			{ error }, 400
		);
	}

	//* GET USERS
	var jsonUsers;
	try {
		jsonUsers = await getTenantUsers("TRAD#" + tenantId);
	} catch (error) {
		console.log("Error", error.stack);
	}
	
	//* REMOVE KEYSORT AND TENANTID FROM USERS
	var users;
	try {
		users = <User[]>JSON.parse(JSON.stringify(jsonUsers));
		for (let i of users) {
			delete i.tenantId;
			delete i.keySort;
		}
	} catch (e) {
		console.log("Error", e.stack);
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
