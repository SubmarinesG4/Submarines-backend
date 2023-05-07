import { APIGatewayProxyResult } from 'aws-lambda';
import { tenantDelete } from '../../../src/functions/tenants/delete/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { DeleteCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { environment } from '../../../src/environment/environment';
import { eventJSON } from '../../../events/deleteTenantEvent';

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

const rightreponse = "{\"response\":\"Tenant eliminato con successo\"}";
const errorreponse = "{\"response\":\"Tenant not found, eliminazione fallita\"}";


describe('Unit test deleteTenant', function () {

    it('verify delete with success 200', async () => {

        process.env.DYNAMODB_TABLE_NAME = environment.dynamo.translations.tableName;
        ddbMock.on(GetCommand, {
            TableName: environment.dynamo.translations.tableName,
            Key: {
                tenantId: "TRAD#tenant1",
                KeySort: "TENANT#tenant1",
            },
          }).resolves({
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
        })
        .on(QueryCommand,{
            TableName: environment.dynamo.translations.tableName,
            KeyConditionExpression: '#tenantId = :pk and begins_with(#KeySort, :sk)',
            ExpressionAttributeNames: {
                "#tenantId": "tenantId",
                "#KeySort": "KeySort"
            },
            ExpressionAttributeValues: {
                ":pk":  "TRAD#tenant1",
                ":sk": "USER#"
            }
         },
        )
        .resolves({
            Items: [{tenantId: 'TRAD#tenant1', KeySort: 'USER#utente1', email: "emailutente1@gmail.com", username: "userutente1"}], 
        })
        .on(DeleteCommand,{
            TableName: environment.dynamo.translations.tableName,
            Key: {
                tenantId: "TRAD#tenant1",
                KeySort: "TENANT#tenant1",
            },
        })
        .resolves({

        });
        const result: APIGatewayProxyResult = await tenantDelete(eventJSON);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(rightreponse);
    });

    
    it('verify tenant not found, not deleted 404', async () => {
        process.env.DYNAMODB_TABLE_NAME = environment.dynamo.translations.tableName;
        ddbMock.on(GetCommand, {
            TableName: environment.dynamo.translations.tableName,
            Key: {
                tenantId: "TRAD#tenant1",
                KeySort: "TENANT#tenant1",
            },
          }).resolves({
            
        })
        .on(QueryCommand,{
            TableName: environment.dynamo.translations.tableName,
            KeyConditionExpression: '#tenantId = :pk and begins_with(#KeySort, :sk)',
            ExpressionAttributeNames: {
                "#tenantId": "tenantId",
                "#KeySort": "KeySort"
            },
            ExpressionAttributeValues: {
                ":pk":  "TRAD#tenant1",
                ":sk": "USER#"
            }
         },
        )
        .resolves({
             
        })
        .on(DeleteCommand,{
            TableName: environment.dynamo.translations.tableName,
            Key: {
                tenantId: "TRAD#tenant1",
                KeySort: "TENANT#tenant1",
            },
        })
        .resolves({

        });
        const result: APIGatewayProxyResult = await tenantDelete(eventJSON);
        expect(result.statusCode).toEqual(404);
        expect(result.body).toEqual(errorreponse);
    });
});