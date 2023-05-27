import { logic } from '../../src/functions/translations/delete/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_deleteTranslation, setupMock_getTranslation , setupMock_getTranslationError } from '../dynamoMocks';

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

describe('Delete translations', function () {

    const pathParamsSuccess = {
        "tenantId": "tenant1",
        "translationKey": "key"
    }

    it('200 success', async () => {
        setupMock_getTranslation(ddbMock);
        setupMock_deleteTranslation(ddbMock);
        const result: any = await logic(pathParamsSuccess);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual({});
    });

    it('404 not found', async () => {
        setupMock_getTranslationError(ddbMock);
        const result: any = await logic(pathParamsSuccess);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant not found"});
    });
});