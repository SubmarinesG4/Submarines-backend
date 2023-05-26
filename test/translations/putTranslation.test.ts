import { logic } from '../../src/functions/translations/put/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenant, setupMock_getUser, setupMock_getTenantTranslations, setupMock_getTranslationError, setupMock_putItem, setupMock_getTenantError } from '../dynamoMocks';

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

describe('Put translation', function () {

    const body200 = { defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "en", content: "hello"}], modifiedbyUser: "email@email.com",
        published: true
    };
    const pathParameters200 = { tenantId: "tenant1", translationKey: "key"};
    var response200 = { translationKey: "key", defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello",
        translations: [{language: "it", content: "ciao"}, {language: "en", content: "hello"} ],
        creationDate: "", modificationDate: "",
        modifiedbyUser: "email@email.com", published: true, versionedTranslations: [{modificationDate: "",
        modifiedbyUser: "email@email.com", translations: [{language: "it", content: "ciao"},
        {language: "en", content: "hello"}], published: true }]
    };

    it.skip('200 success', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result: any = await logic(body200, pathParameters200);

        //* Imposto la data a quella corretta visto che non posso sapere quando verrà eseguito il test
        const jsonBody = JSON.parse(result.body);
        response200.creationDate = jsonBody.creationDate;
        response200.modificationDate = jsonBody.modificationDate;
        response200.versionedTranslations[0].modificationDate = jsonBody.versionedTranslations[0].modificationDate;

        expect(jsonBody).toEqual(response200);
        expect(result.statusCode).toEqual(201);
    });
    
    const body400DefLangNotInList = { defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "fr", content: "boh"}], modifiedbyUser: "email@email.com",
        published: true
    };

    it.skip('400 defaultLang not in translations', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result = await logic(body400DefLangNotInList, pathParameters200);
        expect(JSON.parse(result.body)).toEqual({ error: "defaultTranslationLanguage must be in translations" });
        expect(result.statusCode).toEqual(400);
    })

    const body400DuplicatesInTranslations = { defaultTranslationLanguage: "it", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "it", content: "ciao"}], modifiedbyUser: "email@email.com",
        published: true
    };

    it.skip('400 duplicates in translations', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result = await logic(body400DuplicatesInTranslations, pathParameters200);
        expect(JSON.parse(result.body)).toEqual({ error: "translations must not contain duplicates" });
        expect(result.statusCode).toEqual(400);
    });

    it('400 tenant not found', async () => {
        setupMock_getTenantError(ddbMock);
        const result = await logic(body200, pathParameters200);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant not found" });
        expect(result.statusCode).toEqual(400);
    });
});