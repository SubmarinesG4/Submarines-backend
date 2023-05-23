import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';


const publishTranslation: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

	const dynamo = DynamoDBHandler.getInstance();
	
	const tenantId = "TRAD#" + event.pathParameters.tenantId;
	const translationKey = "TRAD#" + event.pathParameters.tenantId + "#" + event.pathParameters.translationKey;
	const publish: any = event.body.publish;

	try {
		await dynamo.setTranslationPublished(tenantId, translationKey, publish);
	} catch (error) {
		console.log(error);
		return formatJSONResponse(
			{ message: "Error publishing translation" }, 500
		);
	}

	return formatJSONResponse(
		{ message: "OK" }, 200
	);
};

export const main = middyfy(authorizer(publishTranslation));
