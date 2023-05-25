import { GetCommand, QueryCommand, BatchWriteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { environment } from '../src/environment/environment';

export function setupMock_getTenant (ddbMock: any) {
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
            "defaultTranslationLanguage": "en",
            "listAvailableLanguages": [
                "en",
                "it"
            ],
            "token": "",
        }
    })
}

export function setupMock_getTenantError (ddbMock: any) {
    ddbMock.on(GetCommand, {
        TableName: environment.dynamo.translations.tableName,
        Key: {
            tenantId: "TRAD#tenant1",
            keySort: "TENANT#tenant1",
        },
    }).resolves(undefined)
}

export function setupMock_getTenantUsers (ddbMock: any) {
    ddbMock
    .on(QueryCommand, {
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
    })
    .resolves({
        Items: [{name: 'nome', lastName: 'cognome', userEmail: 'emailutente1@gmail.com', creationDate: 'data', username: 'userutente1' }]
    })
}

export function setupMock_getTenantTranslations (ddbMock: any) {
    ddbMock
    .on(QueryCommand, {
        TableName: environment.dynamo.translations.tableName,
        ProjectionExpression: "translationKey, defaultTranslationLanguage, defaultTranslationinLanguage, published, creationDate",
        KeyConditionExpression: "#tenantId = :pk and begins_with(#keySort, :sk)",
        ExpressionAttributeNames: {
            "#tenantId": "tenantId",
            "#keySort": "keySort"
        },
        ExpressionAttributeValues: {
            ":pk": "TRAD#tenant1",
            ":sk": "TRAD#tenant1"
        }
    })
    .resolves({
        Items: [{tenantId: "TRAD#tenant1", keySort: "TRAD#tenant1#key", translationKey: "key", defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", published: true, creationDate: "data" }]
    });
}

export function setupMock_DeleteTenantItems (ddbMock: any) {
    ddbMock
    .on(BatchWriteCommand, {
        RequestItems: {
            [environment.dynamo.translations.tableName]: [
                {DeleteRequest: {
                    Key: {
                        tenantId: "TRAD#tenant1",
                        keySort: "TRAD#tenant1#key"
                    }
                }},
                {DeleteRequest: {
                    Key: {
                        tenantId: "TRAD#tenant1",
                        keySort: "USER#userutente1"
                    }
                }},
            ]
        }
    })
    .resolves({
        undefined
    });
}

export function setupMock_GetAllTenants(ddbMock: any) {
    ddbMock
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        ConsistentRead: true,
        ProjectionExpression: "tenantName, numberTranslationAvailable, defaultTranslationLanguage",
        FilterExpression: 'begins_with(#ks, :ks)',
        ExpressionAttributeValues: {
            ':ks': { S: 'TENANT#'}
        },
        ExpressionAttributeNames: {
            "#ks": "keySort"
        }
    })
    .resolves({
        Items: [{
            numberTranslationAvailable: 100,
            tenantName: 'tenant1',
            defaultTranslationLanguage: 'en'
        }]
    });
}

export function setupMock_GetAllTenantsError(ddbMock: any) {
    ddbMock
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        ConsistentRead: true,
        ProjectionExpression: "tenantName, numberTranslationAvailable, defaultTranslationLanguage",
        FilterExpression: 'begins_with(#ks, :ks)',
        ExpressionAttributeValues: {
            ':ks': { S: 'TENANT#'}
        },
        ExpressionAttributeNames: {
            "#ks": "keySort"
        }
    })
    .resolves({
        Items: []
    });
}

export function setupMock_putItem(ddbMock: any) {
    ddbMock
    .on(PutCommand, {
        TableName: environment.dynamo.translations.tableName,
        Item: {},
    })
    .resolves({});
}