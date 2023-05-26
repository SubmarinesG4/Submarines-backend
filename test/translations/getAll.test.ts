import { logic } from '../../src/functions/translations/getAll/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenantTranslations, setupMock_FilterTranslations } from '../dynamoMocks';

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

    const pathParamsOk = {
        "tenantId": "tenant1",
    }

    const response = {  translations: [{translationKey: "key",
        defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", published: true, creationDate: "data" },
        { tenantId: "TRAD#tenant1", keySort: "TRAD#tenant1#key2", translationKey: "key2", defaultTranslationLanguage: "it",
        defaultTranslationinLanguage: "mario", published: false, creationDate: "data2" }]
    };

    it('200 success without filters', async () => {
        setupMock_getTenantTranslations(ddbMock);
        const result: any = await logic(pathParamsOk, undefined);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(response);
    });

    const queryStringParamsPublished = {
        published: "true",
    }

    const responseFiltered = {  translations: [{ translationKey: "key",
        defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", published: true, creationDate: "data" }]
    }

    it('200 success with published filter', async () => {
        setupMock_FilterTranslations(ddbMock);
        const result: any = await logic(pathParamsOk, queryStringParamsPublished);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(responseFiltered);
    });

    const queryStringParamsPublishedError = {
        "published": "truee",
        "word": "pro",
        "date": "2021-01-01",
    }

    it('400 published != true && != false', async () => {
        const result: any = await logic(pathParamsOk, queryStringParamsPublishedError);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "published must be true or false"});
    });
});