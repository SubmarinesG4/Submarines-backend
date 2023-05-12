import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';

const inviteUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

    const invitedUser = event.body;
	const dynamo = DyanmoDBHandler.getInstance();

	//! CHECK IF TENANT EXISTS
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

	//! CHECK IF USER EXISTS
	try {
		const user = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + invitedUser.userEmail).then((data) => {
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




	try {
        // TODO: implement inviteUser with cognito
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
			invitedUser,
		},
		200
	);

};

export const main = middyfy(authorizer(inviteUser));
