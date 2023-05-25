import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const translationGetAll = async (event) => {

	const tenantId: string = event.pathParameters.tenantId as string;
	const dynamo = DynamoDBHandler.getInstance();
	const params = {
		date: event.queryStringParameters.date,
		published: event.queryStringParameters.published,
		word: event.queryStringParameters.word
	}

	//* Controllo che published sia true o false
	if (params.published != undefined && params.published != "true" && params.published != "false")
		return formatJSONResponse(
			{ error: "published must be true or false" }, 400
		);

	//* Controllo che date sia una data valida
	if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(params.date))
		return formatJSONResponse(
			{ error: "date must be a valid date" }, 400
		);
	
	try {
		var translations: any;
		if(params.date != undefined || params.published != undefined || params.word != undefined){
			translations = await dynamo.getScannedTranslations("TRAD#" + tenantId, params);
			console.log("Filtrate");
		} else {
			translations = await dynamo.getAllTranslations("TRAD#" + tenantId);
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
