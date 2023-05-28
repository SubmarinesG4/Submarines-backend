import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type Roles = "admin" | "super-admin" | "traduttore"

interface APIGatewayProxyEventWithEmail extends APIGatewayProxyEvent {
	userRoles?: Roles[]
}

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEventWithEmail, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: Record<string, unknown>, statusCode = 200) => {
	return {
		statusCode: statusCode,
		body: JSON.stringify(response),
		headers: {
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Origin": "*", // Allow from anywhere 
			"Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE"
		},
	}
}
