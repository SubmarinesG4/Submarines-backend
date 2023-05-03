import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { User } from 'src/types/User';
import { postCreateUser } from 'src/services/dynamodb';

const createUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    
	const newUser: User = {
		tenantId: "TRAD#" + event.pathParameters.tenantId,
		KeySort: "USER#" + event.body.emailUtente,
		emailUtente: event.body.emailUtente,
		username: event.body.username,
		dataCreazioneUtente: new Date().toISOString()
	}

	try {
		postCreateUser(newUser);
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
