import { formatJSONResponse } from "@libs/api-gateway";

type UseType = "super-admin" | "admin" | "traduttore";

interface AuthAttributes {
	userType: UseType;
	userMail: string;
}

const authorizer = (
	handler: (event: any, context: any, callback: any) => void,
	scopes: UseType[]
) => {
	return async (event, context, callback) => {
		const attributes = event.requestContext.authorizer.claims;
		if (!attributes) return formatJSONResponse(
			{
				message: "User has not got the required role for this action",
			},
			403
		);
		const authAttributes: AuthAttributes = {
			userType: attributes["cognito:groups"],
			userMail: attributes.email,
		};
		event.userRoles = authAttributes.userType;

		var flag: boolean = false;
		for (const scope of scopes) {
			if (Array.isArray(authAttributes.userType) ? authAttributes.userType.includes(scope) : attributes.userType === scope)
				flag = true;
		}

		if (!flag)
			return formatJSONResponse(
				{
					message: "User has not got the required role for this action",
				},
				403
			);
		else {
			return handler(event, context, callback);
		}

		/*
		if (event.headers['authorization'] !== "Bearer test")
			return formatJSONResponse(
				{
					message: "User has not got the required role for this action",
				},
				403
			);
		else {
			return handler(event, context, callback);
		}*/
	};
};

function testAuth(auth: any, pathParameters: any) {
	return auth["custom:tenantId"] == pathParameters.tenantId;
}

export { AuthAttributes, authorizer, UseType, testAuth };