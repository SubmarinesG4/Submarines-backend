import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { User } from 'src/types/User';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

const createUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    
	const dynamo = DyanmoDBHandler.getInstance();

	//! Check if tenant exists
	try {
		const tenant = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId).then((data) => {
			return data;
		});
		if (!tenant) {
			return formatJSONResponse(
				{
					error: "Tenant does not exist",
				},
				400
			);
		}
	} catch (e) {
		console.log("ERROR TRYING TO GET ITEM");
		console.log(e);
	}

	//! Check if user already exists
	try {
		const user = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.emailUtente).then((data) => {
			return data;
		});
		if (user) {
			return formatJSONResponse(
				{
					error: "User already exists",
				},
				400
			);
		}
	} catch (e) {
		console.log("ERROR TRYING TO GET ITEM");
		console.log(e);
	}

	const newUser: User = {
		tenantId: "TRAD#" + event.pathParameters.tenantId,
		keySort: "USER#" + event.body.emailUtente,
		userEmail: event.body.emailUtente,
		username: event.body.username,
		creationDate: new Date().toISOString()
	}

	try {
		dynamo.putItem(newUser);
	} catch (e) {
		return formatJSONResponse(
			{
				error: e,
			},
			400
		);
	}

	return formatJSONResponse(
		{
			newUser
		},
		200
	);

};

export const main = middyfy(authorizer(createUser));
