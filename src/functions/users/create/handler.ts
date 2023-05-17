import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { User } from 'src/types/User';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';
//import AWS from "aws-sdk";
//require('dotenv').config()
import { CognitoHandler } from 'src/services/cognitoHandler';




const createUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

    
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
		if (user) {
			return formatJSONResponse(
				{ error: "User already exists", }, 400
			);
		}
	} catch (e) {
		console.log("ERROR TRYING TO GET ITEM");
		console.log(e);
	}

	try {
		cognito.createUser(event.body.username, event.body.emailUtente);
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 500
		);
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
			{ error: e, }, 400
		);
	}

	return formatJSONResponse(
		{ newUser }, 200
	);

};

export const main = middyfy(authorizer(createUser));
