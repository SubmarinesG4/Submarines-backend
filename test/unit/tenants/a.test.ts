import { APIGatewayProxyResult } from 'aws-lambda';
import { getTenant } from '../../../src/functions/tenants/get/handler';
import { eventJSON }from '../../../events/getTenantEvent';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { environment } from '../../../src/environment/environment';

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

describe('Unit test for app handler', function () {

    it('verify happy path 200', async () => {
        
        process.env.DYNAMODB_TABLE_NAME = environment.dynamo.translations.tableName;
        ddbMock.on(GetCommand).resolves({
            "Item": {
                "tenant": {
                    "tenantId": "TRAD#tenant1",
                    "KeySort": "TENANT#tenant1",
                    "nomeTenant": "tenant1",
                    "numeroTraduzioniDisponibili": 1000,
                    "numeroTraduzioniUsate": 0,
                    "linguaTraduzioneDefault": "en",
                    "listaLingueDisponibili": [
                        "en",
                        "it"
                    ],
                    "token": "",
                }
            }
        });
        const result: APIGatewayProxyResult = await getTenant(eventJSON);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual({
            "tenant": {
                "tenantId": "TRAD#tenant1",
                "KeySort": "TENANT#tenant1",
                "nomeTenant": "tenant1",
                "numeroTraduzioniDisponibili": 1000,
                "numeroTraduzioniUsate": 0,
                "linguaTraduzioneDefault": "en",
                "listaLingueDisponibili": [
                    "en",
                    "it"
                ],
                "token": "",
                "listaUtenti": []
            }
        });
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