import { formatJSONResponse } from "@libs/api-gateway";
import { CognitoJwtVerifier } from "aws-jwt-verify";




type UseType = "admin" | "viewer";

interface AuthAttributes {
	userType: UseType;
	userMail: string;
}

const authorizer = (
	handler: (event: any, context: any, callback: any) => void
) => {
	return async (event, context, callback) => {
		/*  const attributes = event.requestContext.authorizer.claims;
		 const authAttributes: AuthAttributes = {
		   userType: attributes["cognito:groups"],
		   userMail: attributes.email,
		 };
		 event.attributes = authAttributes;
		 *//*
		if (event.headers['Authorization'] !== "Bearer test")
			return formatJSONResponse(
				{
					message: "User has not got the required role for this action",
				},
				403
			);
		else {
			return handler(event, context, callback);
		}*/
		// Verifier that expects valid access tokens:
		
	const verifier = CognitoJwtVerifier.create({
		userPoolId: "eu-central-1_OcyZlYZEj",
		tokenUse: "id",
		clientId: "7d5ij9ol01l2405r2i5d4vgdvo",
	});
	
	try {
		console.log(event.headers['Authorization']);
		const payload = await verifier.verify(event.headers['Authorization']);
		console.log("Token is valid. Payload:", payload);
		return handler(event, context, callback);

	} catch(e) {
		console.log("Token not valid!", e);
	}
		};
};

export { AuthAttributes, authorizer, UseType };
