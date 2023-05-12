import { DeleteItemCommand, DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, QueryCommandInput, QueryCommand, DeleteCommandInput, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { environment } from "src/environment/environment";
import { Translation } from "src/types/Translation";
import { Tenant } from "src/types/Tenant";
import { User } from "src/types/User";
import { marshall } from "@aws-sdk/util-dynamodb";

const dbbClient = new DynamoDBClient({
	credentials: {
		accessKeyId: "abcde",
		secretAccessKey: "abcde",
	},
	region: environment.awsRegion,
	endpoint: "http://localhost:8000/"
});

const marshallOptions = {
	// Whether to automatically convert empty strings, blobs, and sets to `null`.
	convertEmptyValues: false, // false, by default.
	// Whether to remove undefined values while marshalling.
	removeUndefinedValues: false, // false, by default.
	// Whether to convert typeof object to map attribute.
	convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
	// Whether to return numbers as a string instead of converting them to native JavaScript numbers.
	wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

const ddbDocClient = DynamoDBDocumentClient.from(dbbClient, translateConfig);

const putTranslation = async (translation: Translation) => {
	// Set the parameters.
	const params = {
		TableName: environment.dynamo.translations.tableName,
		Item: translation,
	};
	try {
		const data = await ddbDocClient.send(new PutCommand(params));
		console.log("Success - item added or updated", data);
	} catch (err) {
		console.log("Error", err.stack);
		throw err;
	}
};

const putTenant = async (tenant: Tenant) => {
	// Set the parameters.
	const params = {
		TableName: environment.dynamo.translations.tableName,
		Item: tenant,
	};
	try {
		const data = await ddbDocClient.send(new PutCommand(params));
		console.log("Success - item added or updated", data);
	} catch (err) {
		console.log("Error", err.stack);
		throw err;
	}
};

const getTranslation = async (tenantId: string, sortKey: string) => {
	// Set the parameters.
	const params: GetCommandInput = {
		TableName: environment.dynamo.translations.tableName,
		Key: { tenantId, sortKey },
	};
	try {
		const data = await ddbDocClient.send(new GetCommand(params));
		console.log("Success - GET", data);
		return data.Item;
	} catch (err) {
		console.log("Error", err.stack);
		throw { err, tenantId };
	}

};

const getAllTranslations = async (projectId: string) => {
	// Set the parameters.
	const params: QueryCommandInput = {
		TableName: environment.dynamo.translations.tableName,
		KeyConditionExpression: "tenantId = :a",
		ExpressionAttributeValues: {
			":a": projectId
		}
	};
	try {
		const data = await ddbDocClient.send(new QueryCommand(params));
		console.log("Success - GET", data);
		return data.Items;
	} catch (err) {
		console.log("Error", err.stack);
		throw { err, projectId };
	}

};

const postCreateUser = async (newUser: User) => {
	const params = {
		TableName: environment.dynamo.translations.tableName,
		Item: newUser
	};
	try {
		const data = await ddbDocClient.send(new PutCommand(params));
		console.log("Success - item added or updated", data);
	} catch (err) {
		console.log("Error", err.stack);
		throw err;
	}
};

const getItem = async (tenantId: string, keySort: string) => {
	const params: GetCommandInput = {
		TableName: environment.dynamo.translations.tableName,
		Key: { tenantId, keySort },
	};
	try {
		const data = await ddbDocClient.send(new GetCommand(params));
		return data.Item;
	} catch (err) {
		console.log("Error", err.stack);
		throw { err, tenantId };
	}
};

const getTenantUsers = async (tenantId: string) => {
	const params: QueryCommandInput = {
		TableName: environment.dynamo.translations.tableName,
        KeyConditionExpression: '#tenantId = :pk and begins_with(#keySort, :sk)',
		ProjectionExpression: "userEmail, username, creationDate",
        ExpressionAttributeNames: {
            "#tenantId": "tenantId",
            "#keySort": "keySort"
        },
        ExpressionAttributeValues: {
            ":pk": tenantId,
            ":sk": "USER#"
        }
	}
	try {
		const data = await ddbDocClient.send(new QueryCommand(params));
		return data.Items;
	} catch (err) {
		console.log("Error", err.stack);
		throw { err, tenantId };
	}
};

const getAllTenants = async () => {
	const params: ScanCommandInput = {
		TableName: environment.dynamo.translations.tableName,
		ConsistentRead: false,
		ProjectionExpression: "tenantName, numberTranslationAvailable, numberTranslationUsed, defaultTranslationLanguage, listAvailableLanguages, #tk",
		FilterExpression: "begins_with(#ks, :ks)",
		ExpressionAttributeValues: {
			":ks": {
				S: "TENANT#"
			}
		},
		ExpressionAttributeNames: {
			"#ks": "keySort",
			"#tk": "token"
		}
	};
	try {
		const data = await ddbDocClient.send(new ScanCommand(params));
		return data.Items;
	} catch (err) {
		console.log("Error", err.stack);
		throw { err };
	}
};

const deleteItem = async (id: string, sort: string) => {
	const params: DeleteCommandInput = {
		TableName: environment.dynamo.translations.tableName,
		Key: marshall({ 
			tenantId: id,
			keySort: sort
		})
	};
	try {
		const res = await ddbDocClient.send(new DeleteItemCommand(params));
		console.log("Success - item deleted", res);
	} catch (err) {
		console.log(err);
	}
};

export { putTranslation, getTranslation, getAllTranslations, putTenant, postCreateUser, deleteItem, getItem, getTenantUsers, getAllTenants }
