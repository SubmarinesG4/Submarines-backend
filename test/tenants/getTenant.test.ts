import { APIGatewayProxyResult } from 'aws-lambda';
import { getTenant } from '../../src/functions/tenants/get/handler';
import { eventJSON } from '../../events/getTenantEvent';

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { environment } from '../../src/environment/environment';

const ddbMock = mockClient(DynamoDBDocumentClient);

jest.mock('@middy/core', () => {
    return (handler) => {
        return {
            use: jest.fn().mockReturnValue(handler), // ...use(ssm()) will return handler function
        }
    }
})

beforeEach(() => {
    ddbMock.reset();
});

const rightreponse =
"{\"tenantName\":\"tenant1\",\"numberTranslationAvailable\":1000,\"numberTranslationUsed\":0,\"defaultTranslationLanguage\":\"en\",\"listAvailableLanguages\":[\"en\",\"it\"],\"token\":\"\",\"userList\":[{\"userEmail\":\"emailutente1@gmail.com\",\"username\":\"userutente1\",\"creationDate\":\"data\"}]}";


describe('Unit test getTenant', function () {

    it('Verify get with success 200', async () => {

        process.env.DYNAMODB_TABLE_NAME = environment.dynamo.translations.tableName;
        ddbMock.on(GetCommand, {
            TableName: environment.dynamo.translations.tableName,
            Key: {
                tenantId: "TRAD#tenant1",
                keySort: "TENANT#tenant1",
            },
        }).resolves({
            "Item": {
                "tenantId": "TRAD#tenant1",
                "keySort": "TENANT#tenant1",
                "tenantName": "tenant1",
                "numberTranslationAvailable": 1000,
                "numberTranslationUsed": 0,
                "defaultTranslationLanguage": "en",
                "listAvailableLanguages": [
                    "en",
                    "it"
                ],
                "token": "",
            }
        })
        .on(QueryCommand,{
            TableName: environment.dynamo.translations.tableName,
            KeyConditionExpression: '#tenantId = :pk and begins_with(#keySort, :sk)',
            ExpressionAttributeNames: {
                "#tenantId": "tenantId",
                "#keySort": "keySort"
            },
            ExpressionAttributeValues: {
                ":pk":  "TRAD#tenant1",
                ":sk": "USER#"
            }
        },)
        .resolves({
            Items: [{tenantId: 'TRAD#tenant1', keySort: 'USER#utente1', userEmail: "emailutente1@gmail.com", username: "userutente1", creationDate: 'data'}], 
        });
        const result: APIGatewayProxyResult = await getTenant(eventJSON);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(rightreponse);
    });

    /**
     * Unhappy path test where the id name record does not exist in the DynamoDB Table
     * We mock the response for DynamoDB GetCommand to produce a invalid response
     */
    /*
    it('verify not found path 404', async () => {
        process.env.DYNAMODB_TABLE_NAME = 'unit_test_dynamodb_table';
        ddbMock.on(GetCommand).resolves({"$metadata":{"httpStatusCode":200,"requestId":"Id","attempts":1,"totalRetryDelay":0}});
        const result: APIGatewayProxyResult = await lambdaHandler(eventJSON);
        expect(result.statusCode).toEqual(404);
    });
    */
});