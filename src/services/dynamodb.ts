import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { environment } from "src/environment/environment";
import { Translation } from "src/types/Translation";

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

const getTranslation = async (projectId: string, translationKey: string) => {
	// Set the parameters.
	const params: GetCommandInput = {
		TableName: environment.dynamo.translations.tableName,
		Key: { projectId, translationKey },
	};
	try {
		const data = await ddbDocClient.send(new GetCommand(params));
		console.log("Success - GET", data);
		return data.Item;
	} catch (err) {
		console.log("Error", err.stack);
		throw { err, projectId };
	}

};
export { putTranslation, getTranslation }