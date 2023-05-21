import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';
import { CognitoHandler } from 'src/services/cognitoHandler';
import { User } from 'src/types/User';


const inviteUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    
	const dynamo = DyanmoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();

	//! Check if tenant exists
	try {
		const tenant = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "TENANT#" + event.pathParameters.tenantId, "tenantId");
		if (!tenant) {
			return formatJSONResponse(
				{ error: "Tenant does not exist", }, 400
			);
		}
	} catch (e) {
		console.log("ERROR TRYING TO GET ITEM");
		console.log(e);
	}

	//! Check if user already exists
	try {
		const user = await dynamo.getItem("TRAD#" + event.pathParameters.tenantId, "USER#" + event.body.emailUtente, "tenantId");
		const cognitoUser: any = await cognito.getUser(event.body.username);
		console.log("cognitoUser: "+cognitoUser);
		if (user || cognitoUser) {
			return formatJSONResponse(
				{ error: "User already exists", }, 400
			);
		}
	} catch (e) {
		console.log("ERROR TRYING TO GET ITEM");
		console.log(e);	
	}

	try {
		cognito.createUser(event.body.username, event.body.userEmail, event.body.name, event.body.lastName);
		cognito.addUserToGroup(event.body.userEmail, event.body.role)
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 500
		);
	}

	const newUser: User = {
		tenantId: "TRAD#" + event.pathParameters.tenantId,
		keySort: "USER#" + event.body.username,
		userEmail: event.body.userEmail,
		username: event.body.username,
		name: event.body.name,
		lastName: event.body.lastName,
		creationDate: new Date().toISOString()
	}

	try {
		dynamo.putItem(newUser);
	} catch (e) {
		cognito.deleteUser(event.body.username); 		//? Se l'utente non si salva nel DB lo tolgo anche da Cognito
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}

	return formatJSONResponse(
		{ newUser }, 200
	);

};

export const main = middyfy(authorizer(inviteUser));
