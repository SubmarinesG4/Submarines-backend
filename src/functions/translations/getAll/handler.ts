import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DynamoDBHandler } from "src/services/dynamoDBHandler";

const translationGetAll = async (event) => {

	const tenantId: string = event.pathParameters.tenantId as string;
	const dynamo = DynamoDBHandler.getInstance();

	try {
		var translations: any;

		//* Se ci sono parametri nella query string devo filtrare
		if (event.queryStringParameters) {
			//* Controllo che published sia true o false
			if (event.queryStringParameters.published && event.queryStringParameters.published != "true" && event.queryStringParameters.published != "false")
				return formatJSONResponse(
					{ error: "published must be true or false" }, 400
				);
			
			translations = await dynamo.getScannedTranslations("TRAD#" + tenantId, event.queryStringParameters);

		}  else {
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
