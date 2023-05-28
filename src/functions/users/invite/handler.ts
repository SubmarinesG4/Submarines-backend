import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { authorizer, testAuth } from 'src/middleware/validators';
import schema from './schema';
import { DynamoDBHandler } from 'src/services/dynamoDBHandler';
import { CognitoHandler } from 'src/services/cognitoHandler';
import { User } from 'src/types/User';


const inviteUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	if (testAuth(event.requestContext.authorizer.claims, event.pathParameters) || event.userRoles.includes("super-admin"))
		return await logic(event.body, event.pathParameters, event.requestContext);
	else
		return formatJSONResponse(
			{
				message: "User has not got the required role for this action",
			},
			403
		);
};

export async function logic(body: any, pathParameters: any, requestContext: any) {
	const dynamo = DynamoDBHandler.getInstance();
	const cognito = CognitoHandler.getInstance();


	//* Check if email and username have the correct format
	const regex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
	if (!regex.test(body.userEmail) || !regex.test(body.username)) {
		return formatJSONResponse(
			{ error: "userEmail/username has not the correct format", }, 400
		);
	}

	if (body.userEmail != body.username) {
		return formatJSONResponse(
			{ error: "Username and email must be the same", }, 400
		);
	}

	//* Check only superadmin can create superadmin
	if (body.role == "super-admin" && requestContext.authorizer.claims["cognito:groups"][0] != "super-admin") {
		return formatJSONResponse(
			{ error: "Only superadmin can create superadmin", }, 400
		);
	}

	//* Check if tenant exists
	try {
		const tenant = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "TENANT#" + pathParameters.tenantId, "tenantId");
		if (!tenant) {
			return formatJSONResponse(
				{ error: "Tenant does not exist", }, 400
			);
		}
	} catch (e) {
		console.log("ERROR TRYING TO GET ITEM");
		console.log(e);
	}

	//* Check if user already exists
	try {
		const user = await dynamo.getItem("TRAD#" + pathParameters.tenantId, "USER#" + body.userEmail, "tenantId");
		const cognitoUser: any = await cognito.getUser(body.username);
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
		cognito.createUser(body.userEmail, body.name, body.lastName, pathParameters.tenantId);
		cognito.addUserToGroup(body.userEmail, body.role)
	} catch (e) {
		return formatJSONResponse(
			{ error: e, }, 500
		);
	}

	const newUser: User = {
		tenantId: "TRAD#" + pathParameters.tenantId,
		keySort: "USER#" + body.username,
		userEmail: body.userEmail,
		username: body.username,
		name: body.name,
		lastName: body.lastName,
		creationDate: new Date().toISOString(),
		role: body.role,
	}

	try {
		dynamo.putItem(newUser);
	} catch (e) {
		cognito.deleteUser(body.username); 		//? Se l'utente non si salva nel DB lo tolgo anche da Cognito
		return formatJSONResponse(
			{ error: e, }, 400
		);
	}

	return formatJSONResponse(
		{
			userEmail: newUser.userEmail,
			username: newUser.username,
			name: newUser.name,
			lastName: newUser.lastName,
			creationDate: newUser.creationDate,
			role: newUser.role,
		}, 200
	);
}

export const main = middyfy(authorizer(inviteUser, ["super-admin", "admin"]));
