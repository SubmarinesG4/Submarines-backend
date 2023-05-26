import { logic } from '../../src/functions/tenants/get/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenant, setupMock_getTenantTranslations, setupMock_getTenantUsers} from '../dynamoMocks';

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

    const rightreponse = { "tenantName": "tenant1", "numberTranslationAvailable": 1000, "numberTranslationUsed": 2,
        "defaultTranslationLanguage": "en", "listAvailableLanguages": ["en", "it"], "token": "",
        "userList": [{ "userEmail": "emailutente1@gmail.com", "username": "userutente1", "name": "nome",
            "lastName": "cognome", "creationDate": "data"}]
    }
    
    const pathParamsSuccess = {
        "tenantId": "tenant1"
    }

    it('200 success', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_getTenantUsers(ddbMock);
        const result: any = await logic(pathParamsSuccess);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(rightreponse);
    });

    const pathParamsNo = {
        "tenantId": "tenant3"
    }
    
    it('404 error', async () => {
        const result: any = await logic(pathParamsNo);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual({});
    });
});
