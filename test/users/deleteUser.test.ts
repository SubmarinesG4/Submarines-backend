import { logic } from '../../src/functions/users/delete/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getUser } from '../dynamoMocks';

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

describe.skip('Delete user', function () {

    const body200 = {
        username: "email@email.com",
    };
    const pathParameters200 = {
        tenantId: "tenant1",
    };

    it('200 Ok', async () => {
        setupMock_getUser(ddbMock);
        const result: any = await logic(body200, pathParameters200);
        expect(JSON.parse(result.body)).toBe({});
        expect(result.statusCode).toBe(200);
    });
});