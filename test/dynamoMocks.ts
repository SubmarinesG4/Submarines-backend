import { GetCommand, QueryCommand, BatchWriteCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
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
        Items: [{translationKey: "key", defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", published: true, creationDate: "data" },
            {tenantId: "TRAD#tenant1", keySort: "TRAD#tenant1#key2", translationKey: "key2", defaultTranslationLanguage: "it", defaultTranslationinLanguage: "mario", published: false, creationDate: "data2" }]
    })
    .on(QueryCommand, {
        TableName: environment.dynamo.translations.tableName,
        ProjectionExpression: "translations, published, translationKey",
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
        Items: [
            { translationKey: 'key', translations: [ { language: 'it', content: 'ciao' },
            { language: 'en', content: 'hello' }], published: true }
        ]
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
    })
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        ConsistentRead: true,
        ProjectionExpression: "tenantName, numberTranslationAvailable, numberTranslationUsed, defaultTranslationLanguage",
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
            numberTranslationAvailable: { N: 100},
            tenantName: {S:'tenant1'},
            defaultTranslationLanguage: {S:'en'}
        }]
    })
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        ConsistentRead: true,
        ProjectionExpression: "tenantName, numberTranslationAvailable, numberTranslationUsed, defaultTranslationLanguage",
        FilterExpression: 'begins_with(#ks, :ks) And contains(#tn, :word)',
        ExpressionAttributeValues: {
            ':ks': { S: 'TENANT#'},
            ':word': { S: 'tenant1' }
        },
        ExpressionAttributeNames: {
            "#ks": "keySort",
            "#tn": "tenantName"
        }
    })
    .resolves({
        Items: [{
            numberTranslationAvailable: { N: 100},
            tenantName: {S:'tenant1'},
            defaultTranslationLanguage: {S:'en'}
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

export function setupMock_getTranslation(ddbMock: any) {

    ddbMock
    .on(GetCommand, {
        TableName: 'translations',
        Key: { 
            tenantId: 'TRAD#tenant1',
            keySort: 'TRAD#tenant1#key'
        },
        ProjectionExpression: 'tenantId',
        ExpressionAttributeNames: undefined
    })
    .resolves({
        Item: {
            tenantId: "TRAD#tenant1",
        }
    })
    .on(GetCommand, {
        TableName: 'translations',
        Key: { 
            tenantId: 'TRAD#tenant1',
            keySort: 'TRAD#tenant1#key'
        },
        ProjectionExpression: "defaultTranslationLanguage, defaultTranslationinLanguage, translations, creationDate, modificationDate, modifiedbyUser, published, versionedTranslations, translationKey",
        ExpressionAttributeNames: undefined
    })
    .resolves({
        Item: {
            defaultTranslationLanguage: "en",
            defaultTranslationinLanguage: "hello",
            translations: {},
            creationDate: "data",
            modificationDate: "data",
            modifiedbyUser: "user",
            published: true,
            versionedTranslations: {},
            translationKey: "key"
        }
    })
    .on(GetCommand, {
        TableName: 'translations',
        Key: { 
            tenantId: 'TRAD#tenant1',
            keySort: 'TRAD#tenant1#key'
        },
        ProjectionExpression: "versionedTranslations, creationDate",
        ExpressionAttributeNames: undefined
    })
    .resolves({
        Item: {
            creationDate: "data",
            versionedTranslations: [
                {
                    modificationDate: "",
                    modifiedbyUser: "email@email.com",
                    translations: [
                        {
                            language: "it",
                            content: "ciao"
                        },
                        {
                            language: "en",
                            content: "hello"
                        }
                    ],
                    published: true
                }
            ]
        }
    })
}

export function setupMock_getTranslationError(ddbMock: any) {
    ddbMock.on(GetCommand, {
        TableName: 'translations',
        Key: { 
            tenantId: 'TRAD#tenant1',
            keySort: 'TRAD#tenant1#key'
        },
        ProjectionExpression: 'tenantId',
        ExpressionAttributeNames: undefined
    })
    .resolves(undefined)
    .on(GetCommand, {
        TableName: 'translations',
        Key: { 
            tenantId: 'TRAD#tenant1',
            keySort: 'TRAD#tenant1#key'
        },
        ProjectionExpression: "defaultTranslationLanguage, defaultTranslationinLanguage, translations, creationDate, modificationDate, modifiedbyUser, published, versionedTranslations, translationKey",
        ExpressionAttributeNames: undefined
    })
    .resolves(undefined)
}

export function setupMock_deleteTranslation(ddbMock: any) {
    ddbMock.on(DeleteCommand, {
        TableName: environment.dynamo.translations.tableName,
        Key: {
            tenantId: "TRAD#tenant1",
            keySort: "TRAD#tenant1#key",
        },
    }).resolves({})
}

export function setupMock_FilterTranslations (ddbMock: any) {
    ddbMock
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        ProjectionExpression: 'translationKey, defaultTranslationLanguage, defaultTranslationinLanguage, creationDate, published',
        FilterExpression: '#id = :tenantId And begins_with(#ks, :starts) And #pub = :published',
        ExpressionAttributeValues: {
            ':tenantId': { S: 'TRAD#tenant1' },
            ':starts': { S: 'TRAD#' },
            ':published': { BOOL: 'true' }
        },
        ExpressionAttributeNames: { '#id': 'tenantId', '#ks': 'keySort', '#pub': 'published' }
    })
    .resolves({
        Items:[
            {
                defaultTranslationLanguage: { S: 'en' },
                published: { BOOL: true },
                translationKey: { S: 'key' },
                creationDate: { S: 'data' },
                defaultTranslationinLanguage: { S: 'hello' }
            }
        ]
    });


}

export function setupMock_getTenantByToken (ddbMock: any) {
    ddbMock
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        FilterExpression: '#tk = :tk',
        ProjectionExpression: 'tenantId, listAvailableLanguages, defaultTranslationLanguage',
        ExpressionAttributeValues: { ':tk': { S: 'provatoken' } },
        ExpressionAttributeNames: { '#tk': 'token' }
    })
    .resolves({
        Items:[
            {
                listAvailableLanguages: { L: [ {S: 'en'}, {S: 'it'} ] },
                tenantId: { S: 'TRAD#tenant1' },
                defaultTranslationLanguage: { S: 'en' }
            }
        ]
    })
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        FilterExpression: '#tk = :tk',
        ProjectionExpression: 'tenantId, listAvailableLanguages, defaultTranslationLanguage',
        ExpressionAttributeValues: { ':tk': { S: 'provatokensbagliato' } },
        ExpressionAttributeNames: { '#tk': 'token' }
    })
    .resolves({
        Items:[{
            listAvailableLanguages: { L: [ {S: 'en'}, {S: 'it'} ] },
            tenantId: { S: 'TRAD#tenant1' },
            defaultTranslationLanguage: { S: 'en' }
        },{
            listAvailableLanguages: { L: [ {S: 'en'}, {S: 'it'} ] },
            tenantId: { S: 'TRAD#tenant1' },
            defaultTranslationLanguage: { S: 'en' }
        }]
    })
    .on(ScanCommand, {
        TableName: environment.dynamo.translations.tableName,
        FilterExpression: '#tk = :tk',
        ProjectionExpression: 'tenantId, listAvailableLanguages, defaultTranslationLanguage',
        ExpressionAttributeValues: { ':tk': { S: 'provatokenlingue' } },
        ExpressionAttributeNames: { '#tk': 'token' }
    })
    .resolves({
        Items:[{
            
            tenantId: { S: 'TRAD#tenant1' },
            defaultTranslationLanguage: { S: 'en' }
        }]
    });
}

export function setupMock_deleteTenant (ddbMock: any) {
    ddbMock
    .on(DeleteCommand,{
        TableName: environment.dynamo.translations.tableName,
        RequestItems:{ translations: { DeleteRequest: {Key: 'tenant1'} }}
    })
    .resolves({

    });
}

export function setupMock_getUser (ddbMock: any) {
    ddbMock.on(GetCommand, {
        TableName: environment.dynamo.translations.tableName,
        Key: {
            tenantId: 'TRAD#tenant1',
            keySort: 'USER#email@email.com'
        },
        ProjectionExpression: 'tenantId',
        ExpressionAttributeNames: undefined
    }).resolves({
        Item: {
        tenantId: "TRAD#tenant1",
    }});
}

export function setupMock_getUserError (ddbMock: any) {
    ddbMock.on(GetCommand, {
        TableName: environment.dynamo.translations.tableName,
        Key: {
            tenantId: 'TRAD#tenant1',
            keySort: 'USER#email@email.com'
        },
        ProjectionExpression: 'tenantId',
        ExpressionAttributeNames: undefined
    }).resolves(undefined);
}

export function setupMock_getTenant5Translations (ddbMock: any) {
    ddbMock
    .on(GetCommand, {
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
            "numberTranslationAvailable": 5,
            "defaultTranslationLanguage": "en",
            "listAvailableLanguages": [
                "en",
                "it"
            ],
            "token": "",
        }
    });
}

export function setupMock_getAll5Translations (ddbMock: any) {
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
        Items: [{},{},{},{},{}]
    });
}

export function setupMock_deleteUser(ddbMock: any) {
    ddbMock.on(DeleteCommand, {
        TableName: environment.dynamo.translations.tableName,
        Key: {
            tenantId: "TRAD#tenant1",
            keySort: "USER#email@email.com",
        },
    }).resolves({})
}