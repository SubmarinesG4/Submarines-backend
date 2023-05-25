import { logic } from '../../src/functions/tenants/update/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenant, setupMock_putItem, setupMock_getTenantTranslations, setupMock_getTenantUsers, setupMock_getTenantError } from '../dynamoMocks';

//* Setup mock
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



describe('Update tenant', function () {

    const rightreponse = { "tenantName": "tenant1", "numberTranslationAvailable": 500, "numberTranslationUsed": 1,
        "defaultTranslationLanguage": "it", "listAvailableLanguages": ["en", "it","fr"], "token": "",
        "users": [{ "userEmail": "emailutente1@gmail.com", "username": "userutente1", "name": "nome",
            "lastName": "cognome", "creationDate": "data"}]
    }
    const bodySuccess = { "numberTranslationAvailable": 500, "listAvailableLanguages": ["en", "it", "fr"],
        "defaultTranslationLanguage": "it"
    }
    const pathParamsSuccess = {
        "tenantId": "tenant1"
    }

    it.skip('200 success', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_putItem(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_getTenantUsers(ddbMock);
        const result: any = await logic(bodySuccess, pathParamsSuccess);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(rightreponse);
    });
    
    it.skip('400 nothing to update', async () => {
        const result: any = await logic({},{});
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "Nothing to update" });
    });

    const pathParamsNothingToUpdate = {
        "tenantId": "tenant2"
    }

    it.skip('404 nothing to update', async () => {
        setupMock_getTenantError(ddbMock);
        const result: any = await logic(bodySuccess, pathParamsNothingToUpdate);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant not found" });
    });

    const bodyDuplicates = {
        "numberTranslationAvailable": 500, "listAvailableLanguages": ["en", "it", "it"],
    }

    it.skip('400 duplicates in listAvailableLanguages', async () => {
        setupMock_getTenant(ddbMock);
        const result: any = await logic(bodyDuplicates, pathParamsSuccess);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "listAvailableLanguages must not contain duplicates" });
    });

    const bodyNotIn = {
        "numberTranslationAvailable": 500,
        "listAvailableLanguages": ["en", "it", "es"],
        "defaultTranslationLanguage": "fr"
    }

    it.skip('400 defaultTranslation not in list', async () => {
        setupMock_getTenant(ddbMock);
        const result: any = await logic(bodyNotIn, pathParamsSuccess);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "defaultTranslationLanguage must be in listAvailableLanguages" });
    });
});
