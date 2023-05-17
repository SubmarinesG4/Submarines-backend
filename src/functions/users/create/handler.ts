import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer } from 'src/middleware/validators';
import schema from './schema';
import { User } from 'src/types/User';
import { DyanmoDBHandler } from 'src/services/dynamoDBHandler';
import AWS from "aws-sdk";
require('dotenv').config()




const createUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

    
	const dynamo = DyanmoDBHandler.getInstance();

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

	// Create User via AWS Cognito
	var params = {
	UserPoolId: "eu-central-1_OcyZlYZEj", /* required */
	Username: event.body.username, /* required */
	TemporaryPassword: 'passw0rdTEmp!',
	UserAttributes: [
		{
			Name: 'email', /* required */
			Value: 'cagiper451@glumark.com'
		}
		],
	};
	
	var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
	region: "eu-central-1",
	credentials: {
		accessKeyId: process.env.Access_key_ID, // IAM access ID
		secretAccessKey: process.env.Secret_access_key, // IAM Secret
	}
	});
	cognitoidentityserviceprovider.adminCreateUser(params,function(err, result){
	if(err) {
		console.log('err:',err);
		} else {
		console.log('result:',result);
		console.log('user creato in Cognito');
		}
	});

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
