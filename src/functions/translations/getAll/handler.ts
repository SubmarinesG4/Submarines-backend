import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { getAllTranslations } from "src/services/dynamodb";

const translationGetAll = async (event) => {
	const projectId = event.pathParameters.projectId as string;

	try {
		const translations = await getAllTranslations(projectId)
		return formatJSONResponse(
			{ items: translations },
			200
		);
	} catch (error) {
		return formatJSONResponse(
			{
				error,
			},
			400
		);
	}
};

export const main = middyfy(
	translationGetAll
);
