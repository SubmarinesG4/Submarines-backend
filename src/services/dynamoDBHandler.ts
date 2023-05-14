import { DeleteItemCommand, DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, GetCommandInput, QueryCommandInput, DeleteCommandInput, PutCommand, PutCommandInput, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { environment } from "src/environment/environment";
import { marshall, unmarshall} from "@aws-sdk/util-dynamodb";

export class DyanmoDBHandler {

    private static instance: DyanmoDBHandler;
    private dbClient: DynamoDBDocumentClient;

    //* DB Client configuration
	private constructor() {
        const client = new DynamoDBClient({
            credentials: {
                accessKeyId: "abcde",
                secretAccessKey: "abcde",
            },
            region: environment.awsRegion,
            endpoint: "http://localhost:8000/"
        });
        // Whether to automatically convert empty strings, blobs, and sets to `null`
        const marshallOptions = {
            convertEmptyValues: false,
            removeUndefinedValues: false,
            convertClassInstanceToMap: false,
        };
        // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
        const unmarshallOptions = {
            wrapNumbers: false
        };
        this.dbClient = DynamoDBDocumentClient.from(client, { marshallOptions, unmarshallOptions });
	}

    //*  Singleton
    static getInstance(): DyanmoDBHandler {
        if (!this.instance) {
            this.instance = new DyanmoDBHandler();
        }
        return this.instance;
    }

    async putItem (item: any) {
        const params: PutCommandInput = {
            TableName: environment.dynamo.translations.tableName,
            Item: item,
        };
        try {
            const data = await this.dbClient.send(new PutCommand(params));
            console.log("Success - item added or updated", data);
        } catch (err) {
            console.log("Error", err.stack);
            throw err;
        }
    }

    //* projectExpression serve per dire su quali colonne fare la proiezione
    //* addToken serve nel caso vada presa anche la colonna token, visto che "token" è keyword riservata di dynamodb
    async getItem(tenantId: string, keySort: string, projectionExpression: string = "tenantId, keySort", addToken: boolean = false) {

        const params: GetCommandInput = {
            TableName: environment.dynamo.translations.tableName,
            Key: { tenantId, keySort },
            ProjectionExpression: projectionExpression,
            ExpressionAttributeNames: addToken ? {
                "#tk": "token"
            } : undefined,
        };

        //* Esegue il comando
        try {
            const data = await this.dbClient.send(new GetCommand(params));
            return data.Item;
        } catch (err) {
            console.log("Error", err.stack);
            throw { err, tenantId };
        }
    }

    async deleteItem (id: string, sort: string) {
        const params: DeleteCommandInput = {
            TableName: environment.dynamo.translations.tableName,
            Key: marshall({ 
                tenantId: id,
                keySort: sort
            })
        };
        try {
            const res = await this.dbClient.send(new DeleteItemCommand(params));
            console.log("Success - item deleted", res);
        } catch (err) {
            console.log(err);
        }
    }

    async getTenantUsers (tenantId: string) {
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
            const data = await this.dbClient.send(new QueryCommand(params));
            return data.Items;
        } catch (err) {
            console.log("Error", err.stack);
            throw { err, tenantId };
        }
    }

    async getAllTenants() {
        const params: ScanCommandInput = {
            TableName: environment.dynamo.translations.tableName,
            ConsistentRead: true,
            ProjectionExpression: "tenantName, numberTranslationAvailable, numberTranslationUsed, defaultTranslationLanguage, listAvailableLanguages",
            FilterExpression: 'begins_with(#ks, :ks)',
            ExpressionAttributeValues: {
                ':ks': { S: 'TENANT#'}
            },
            ExpressionAttributeNames: {
                "#ks": "keySort"
            }
        };
        try {
            const data = await this.dbClient.send(new ScanCommand(params));
            let items = data.Items;
            items = items.map(item => {
                return unmarshall(item);
            });
            return items;
        } catch (err) {
            console.log("Error", err.stack);
            throw { err };
        }
    }

    async getAllTranslations(tenantId: string) {
        const params: QueryCommandInput = {
            TableName: environment.dynamo.translations.tableName,
            ProjectionExpression: "keySort, defaultTranslationLanguage, defaultTranslationinLanguage",
            KeyConditionExpression: "#tenantId = :pk and begins_with(#keySort, :sk)",
            ExpressionAttributeNames: {
                "#tenantId": "tenantId",
                "#keySort": "keySort"
            },
            ExpressionAttributeValues: {
                ":pk": tenantId,
                ":sk": tenantId
            }
        };

        try {
            const data = await this.dbClient.send(new QueryCommand(params));
            return data.Items;
        } catch (err) {
            console.log("Error", err.stack);
            throw { err };
        }
    }
}