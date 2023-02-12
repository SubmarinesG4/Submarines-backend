import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { authorizer } from "src/middleware/validators";
import { getTranslation } from "src/services/dynamodb";

const translationGet = async (event) => {
	const projectId = event.pathParameters.projectId as string;
	const translationKey = event.pathParameters.translationKey as string;

	try {
		const translation = await getTranslation(projectId, translationKey)
		if (!translation.translationKey) {
			return formatJSONResponse({

			}, 404);
		}
		return formatJSONResponse(
			translation,
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
	authorizer(translationGet)
);
