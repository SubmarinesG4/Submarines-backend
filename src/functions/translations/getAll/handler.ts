import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const translationGetAll = async (event) => {
	const tenantId: string = event.pathParameters.tenantId as string;

	const dynamo = DynamoDBHandler.getInstance();

	const queryStringParameters = event.queryStringParameters;
	
	try {
		var translations: any;
		if(queryStringParameters == null || ( queryStringParameters.published == "" || queryStringParameters.date == "" || queryStringParameters.word == "")){
			translations = await dynamo.getAllTranslations("TRAD#" + tenantId);
		}
		else {
			translations = await dynamo.getScannedTranslations("TRAD#" + tenantId, queryStringParameters);	
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
	authorizer(translationGetAll, ["super-admin", "admin", "traduttore"])
);
