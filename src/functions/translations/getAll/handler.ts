import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { DyanmoDBHandler } from "src/services/dynamoDBHandler";

const translationGetAll = async (event) => {
	const tenantId: string = event.pathParameters.tenantId as string;

	const dynamo = DyanmoDBHandler.getInstance();

	try {
		const translations = await dynamo.getAllTranslations("TRAD#" + tenantId);
		if (translations.length === 0) {
			return formatJSONResponse({}, 404);
		}
		return formatJSONResponse(
			{ translations }, 200
		);
	} catch	(error) {
		return formatJSONResponse(
			error, 400
		);
	}
};

export const main = middyfy(
	authorizer(translationGetAll)
);
