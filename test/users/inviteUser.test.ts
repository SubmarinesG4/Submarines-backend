import { logic } from '../../src/functions/users/invite/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { CognitoHandler } from '../../src/services/cognitoHandler';
import { setupMock_getTenantError, setupMock_getUser, setupMock_getTenant, setupMock_getUserError } from '../dynamoMocks';

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
jest
.spyOn(CognitoHandler.prototype, 'getUser')
.mockReturnValue(Promise.resolve("string"));

jest
.spyOn(CognitoHandler.prototype, 'createUser')
.mockImplementation(() => {});

jest
.spyOn(CognitoHandler.prototype, 'addUserToGroup')
.mockImplementation(() => {});

beforeEach(() => {
    ddbMock.reset();
});

describe('Invite user', function () {

    const body200 = {
        userEmail: "email@email.com",
        username: "email@email.com",
        name: "name",
        lastName: "lastname",
        role: "super-admin"
    }

    const pathParameters200 = {
        tenantId: "tenant1",
    };

    const requestContext200 = {
        authorizer: {
            claims: {
                "cognito:groups": ["super-admin"]
            }
        }
    }

    const body400usernameEmailDifferent = {
        userEmail: "f@prova.com",
        username: "fd@prova.com",
        name: "name",
        lastName: "lastname",
        role: "traduttore"
    }

    it('400 username and email different', async () => {
        const result: any = await logic(body400usernameEmailDifferent, pathParameters200, requestContext200);
        expect(JSON.parse(result.body)).toEqual({ error: "Username and email must be the same" });
        expect(result.statusCode).toBe(400);
    });

    const body400FormatError = {
        username: "emailemail.com",
    };

    it('400 email format error', async () => {
        const result: any = await logic(body400FormatError, pathParameters200, requestContext200);
        expect(JSON.parse(result.body)).toEqual({ error: "userEmail/username has not the correct format" });
        expect(result.statusCode).toBe(400);
    });

    const requestContext400adminSuperadmin = {
        authorizer: {
            claims: {
                "cognito:groups": ["admin"]
            }
        }
    }

    it('400 admin creating superadmin', async () => {
        const result: any = await logic(body200, pathParameters200, requestContext400adminSuperadmin);
        expect(JSON.parse(result.body)).toEqual({ error: "Only superadmin can create superadmin" });
        expect(result.statusCode).toBe(400);
    });

    it('400 tenant does not exist', async () => {
        setupMock_getTenantError(ddbMock);
        const result: any = await logic(body200, pathParameters200, requestContext200);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant does not exist" });
        expect(result.statusCode).toBe(400);
    });

    it('400 user already exists', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        const result: any = await logic(body200, pathParameters200, requestContext200);
        expect(JSON.parse(result.body)).toEqual({ error: "User already exists" });
        expect(result.statusCode).toBe(400);
    });

    jest
        .spyOn(CognitoHandler.prototype, 'getUser')
        .mockReturnValue(Promise.resolve());

    const result200 = {
        userEmail: "email@email.com",
        username: "email@email.com",
        name: "name",
        lastName: "lastname",
        role: "super-admin",
        creationDate: "",
    };

    it('200 created', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUserError(ddbMock);
        const result: any = await logic(body200, pathParameters200, requestContext200);

        result200.creationDate = JSON.parse(result.body).creationDate;

        expect(JSON.parse(result.body)).toEqual(result200);
        expect(result.statusCode).toBe(200);
    });
});