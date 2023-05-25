import { logic } from '../../src/functions/tenants/update/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { setupMock_getTenant, setupMock_putItem, setupMock_getTenantTranslations, setupMock_getTenantUsers } from './dynamoMocks';

const ddbMock = mockClient(DynamoDBDocumentClient);

jest.mock('@middy/core', () => {
    return (handler) => {
        return {
            use: jest.fn().mockReturnValue(handler),
        }
    }
});

beforeEach(() => {
    ddbMock.reset();
});

const rightreponse = {
    "tenantName": "tenant1",
    "numberTranslationAvailable": 1000,
    "numberTranslationUsed": 1,
    "defaultTranslationLanguage": "it",
    "listAvailableLanguages": [
        "en",
        "it",
        "fr"
    ],
    "token": "",
    "users": [
        {
            "userEmail": "emailutente1@gmail.com",
            "username": "userutente1",
            "name": "nome",
            "lastName": "cognome",
            "creationDate": "data"
        }
    ]
}

const body = {
	"listAvailableLanguages": ["en", "it", "fr"],
    "defaultTranslationLanguage": "it"
}

const pathParameters = {
    "tenantId": "tenant1"
}

describe('Unit test getTenant', function () {

    it('Verify get with success 200', async () => {

        setupMock_getTenant(ddbMock);
        setupMock_putItem(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_getTenantUsers(ddbMock);
        const result: any = await logic(body, pathParameters);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(rightreponse);
    });
    /*
    it('verify not found path 404', async () => {
        process.env.DYNAMODB_TABLE_NAME = 'unit_test_dynamodb_table';
        setupMock_getTenantError(ddbMock);
        const result: APIGatewayProxyResult = await getTenant(eventJSON);
        expect(result.statusCode).toEqual(404);
    });
    */
});
