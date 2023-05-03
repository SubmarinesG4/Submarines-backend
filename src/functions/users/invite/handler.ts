import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { getItem } from 'src/services/dynamodb';

const inviteUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

    const invitedUser = event.body;

	//! CHECK IF TENANT EXISTS
	try {
		const tenant = await getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId).then((data) => {
			if (data)
				return data;
			else
				return null;
		});
		if (tenant == null) {
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
		const user = await getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + invitedUser.emailUtente).then((data) => {
			if (data)
				return data;
			else
				return null;
		});
		if (user != null) {
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
