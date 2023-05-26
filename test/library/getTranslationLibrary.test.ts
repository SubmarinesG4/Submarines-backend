import { logic } from '../../src/functions/library/get/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenantByToken, setupMock_getTenantTranslations } from '../dynamoMocks';

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

describe('Get translation Library', function () {

    const pathParamsOk = {
        "token": "provatoken",
        "language": "en"
    }

    const response = {
        translations: {
            key: "hello",
        }
    };

    it('200 success', async () => {
        setupMock_getTenantByToken(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        const result: any = await logic(pathParamsOk);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(response);
    });
/*
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
    });*/
});