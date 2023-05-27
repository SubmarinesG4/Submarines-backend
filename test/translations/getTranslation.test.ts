import { logic } from '../../src/functions/translations/get/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTranslation , setupMock_getTranslationError } from '../dynamoMocks';

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

describe('Get translation', function () {

    const pathParamsSuccess = {
        "tenantId": "tenant1",
        "translationKey": "key"
    }

    const response = { defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: {},
        creationDate: "data", modificationDate: "data", modifiedbyUser: "user", published: true,
        versionedTranslations: {}, translationKey: "key"
    };

    it('200 success', async () => {
        setupMock_getTranslation(ddbMock);
        const result: any = await logic(pathParamsSuccess);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(response);
    });

    it('404 not found', async () => {
        setupMock_getTranslationError(ddbMock);
        const result: any = await logic(pathParamsSuccess);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant not found"});
    });
});