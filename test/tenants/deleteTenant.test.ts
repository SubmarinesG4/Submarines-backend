import { logic } from '../../src/functions/tenants/delete/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenant, setupMock_putItem, setupMock_getTenantTranslations, setupMock_getTenantUsers, setupMock_deleteTenant } from '../dynamoMocks';

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

beforeEach(() => {
    ddbMock.reset();
});



describe('Delete tenant', function () {
    
    const pathParamsSuccess = {
        "tenantId": "tenant1"
    }

    it('200 success', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_putItem(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_getTenantUsers(ddbMock);
        setupMock_deleteTenant(ddbMock);
        const result: any = await logic(pathParamsSuccess);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual({});
    });
    
    const pathParamsNo = {
        "tenantId": "tenant3"
    }

    it('404 tenant not found', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_putItem(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_getTenantUsers(ddbMock);
        setupMock_deleteTenant(ddbMock);
        const result: any = await logic(pathParamsNo);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual({});
    });
});
