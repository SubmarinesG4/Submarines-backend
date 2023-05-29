import { logic } from '../../src/functions/tenants/put/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenantError, setupMock_putItem, setupMock_getTenant } from '../dynamoMocks';

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

describe('Put tenant', function () {
    
    const pathParams200 = {
        "tenantId": "tenant1"
    }
    const body200 = {
        "numberTranslationAvailable": 5,
        "defaultTranslationLanguage": "en",
        "listAvailableLanguages": ["en", "it"]
    }
    const response200 = {
        tenantName: "tenant1",
        numberTranslationAvailable: 5,
        defaultTranslationLanguage: "en",
        listAvailableLanguages: ["en", "it"],
        numberTranslationUsed: 0,
        token: "a9477290-9047-5d96-b11c-1f82994f0aa2",
        userList: []
    }

    it('200 success', async () => {
        setupMock_getTenantError(ddbMock);
        setupMock_putItem(ddbMock);
        const result: any = await logic(body200, pathParams200);
        expect(result.statusCode).toEqual(201);
        expect(JSON.parse(result.body)).toEqual(response200);
    });

    const body400defLangNotInLanguages = {
        "numberTranslationAvailable": 5,
        "defaultTranslationLanguage": "fr",
        "listAvailableLanguages": ["en", "it"]
    }

    it('400 Default lang not in list', async () => {
        const result: any = await logic(body400defLangNotInLanguages, pathParams200);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "defaultTranslationLanguage must be in listAvailableLanguages" });
    });

    const body400duplicates = {
        "numberTranslationAvailable": 5,
        "defaultTranslationLanguage": "en",
        "listAvailableLanguages": ["en", "en"]
    }

    it('400 list with duplicates', async () => {
        const result: any = await logic(body400duplicates, pathParams200);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "listAvailableLanguages must not contain duplicates" });
    });

    it('400 tenant already exists',async () => {
        setupMock_getTenant(ddbMock);
        const result: any = await logic(body200, pathParams200);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant already exists" });
    });
});
