import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';

const inviteUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

    const invitedUser = event.body;
    console.log(invitedUser);
    
	try {
        // TODO: check if tenant exists
        // TODO: check if user already exists
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
