import { logic } from '../../src/functions/users/delete/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_deleteUser, setupMock_getUser } from '../dynamoMocks';
import { CognitoHandler } from '../../src/services/cognitoHandler';

//* Setup mock
const ddbMock = mockClient(DynamoDBDocumentClient);
jest.mock('@middy/core', () => {
    return (handler) => {
        return {
            use: jest.fn().mockReturnValue(handler),
        }
    }
});
//* Setup mock cognito
const AWS = require('aws-sdk');
jest.mock('aws-sdk');

AWS.CognitoIdentityServiceProvider.prototype.adminDeleteUser = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({})
});
jest
    .spyOn(CognitoHandler.prototype, 'getUser')
    .mockReturnValue(Promise.resolve("string"));

beforeEach(() => {
    ddbMock.reset();
});

describe('Delete user', function () {

    const body200 = {
        username: "email@email.com",
    };
    const pathParameters200 = {
        tenantId: "tenant1",
    };

    it('200 Ok', async () => {
        setupMock_getUser(ddbMock);
        setupMock_deleteUser(ddbMock);
        const result: any = await logic(body200, pathParameters200);
        expect(result.statusCode).toBe(200);
    });

    it('404 ', async () => {
        setupMock_deleteUser(ddbMock);
        const result = await logic(body200, pathParameters200);
        expect(JSON.parse(result.body)).toEqual({ error: "User not found" });
        expect(result.statusCode).toBe(404);
    });
});