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
			console.log(attributes["cognito:groups"]);
			const authAttributes: AuthAttributes = {
				userType: attributes["cognito:groups"],
				userMail: attributes.email,
			};
			event.attributes = authAttributes.userType;

			var flag: boolean = false;
			for (const scope of scopes) {
				if (authAttributes.userType == scope)
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

export { AuthAttributes, authorizer, UseType };
