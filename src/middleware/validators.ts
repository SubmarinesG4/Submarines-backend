import { formatJSONResponse } from "@libs/api-gateway";
import { CognitoJwtVerifier } from "aws-jwt-verify";


type UseType = "admin" | "viewer";

interface AuthAttributes {
	userType: UseType;
	userMail: string;
}

const authorizer = (handler: (event: any, context: any, callback: any) => void) => {
		return async (event, context, callback) => {
			/*
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
		
		const verifier = CognitoJwtVerifier.create({
			userPoolId: "eu-central-1_OcyZlYZEj",
			tokenUse: "id",
			clientId: "7d5ij9ol01l2405r2i5d4vgdvo",
		});
		
		try {
			console.log(event.headers['Authorization']);
			const payload = await verifier.verify(event.headers['Authorization']);
			if (hasAccess(payload["cognito:groups"][0], event.path, event.httpMethod))
				return handler(event, context, callback);
			else
				return formatJSONResponse(
					{
						message: "User has not got the required role for this action",
					},
					403
				);
		} catch(e) {
			console.log("Token not valid!", e);
		}
	};
};

function hasAccess (role: string, path: string, method: string) {
	switch (role) {
		case "super-admin":
			return true;
		case "admin":
			if (path.endsWith('translations') && method === "GET") return true;
			if (path.endsWith('invite') && method === "POST") return true;
			if (path.includes('translation') && (method === "GET" || method == "DELETE" || method == "PUT")) return true;
			if ((path.split("/").length - 1) == 1 && method == "GET" && !path.includes("tenants")) return true;
			return false;
		case "traduttore":
			if (path.includes('translation') && (method === "GET" || method == "DELETE" || method == "PUT")) return true;
			if (path.endsWith('translations') && method === "GET") return true;
			if ((path.split("/").length - 1) == 1 && method == "GET" && !path.includes("tenants")) return true;
			return false;
		default:
			return false;
	}
}

export { AuthAttributes, authorizer, UseType };
