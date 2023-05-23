import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DyanmoDBHandler } from "src/services/dynamoDBHandler";

const translationGetAll = async (event) => {
	const tenantId: string = event.pathParameters.tenantId as string;

	const dynamo = DyanmoDBHandler.getInstance();

	const queryStringParameters = event.queryStringParameters;
	
	try {
		var translations: any;
		if (!queryStringParameters)
			translations = await dynamo.getAllTranslations("TRAD#" + tenantId);
		else
			translations = await dynamo.getScannedTranslations("TRAD#" + tenantId, queryStringParameters);
		if (translations.length === 0) {
			return formatJSONResponse({}, 404);
		}
		return formatJSONResponse(
			{ translations }, 200
		);
	} catch	(error) {
		return formatJSONResponse(
			error, error.statusCode
		);
	}
};

export const main = middyfy(
	authorizer(translationGetAll)
);
