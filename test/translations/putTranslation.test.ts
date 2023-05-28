import { logic } from '../../src/functions/translations/put/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenant, setupMock_getUser, setupMock_getTenantTranslations, setupMock_getTranslationError, setupMock_putItem, setupMock_getTenantError, setupMock_getUserError, setupMock_getTenant5Translations, setupMock_getAll5Translations, setupMock_getTranslation } from '../dynamoMocks';

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

    const body201 = { defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "en", content: "hello"}], modifiedbyUser: "email@email.com",
        published: true
    };
    const pathParameters200 = { tenantId: "tenant1", translationKey: "key"};
    var response201 = { translationKey: "key", defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello",
        translations: [{language: "it", content: "ciao"}, {language: "en", content: "hello"} ],
        creationDate: "", modificationDate: "",
        modifiedbyUser: "email@email.com", published: true, versionedTranslations: [{modificationDate: "",
        modifiedbyUser: "email@email.com", translations: [{language: "it", content: "ciao"},
        {language: "en", content: "hello"}], published: true }]
    };

    it('201 created', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result: any = await logic(body201, pathParameters200, "email", false);

        //* Imposto la data a quella corretta visto che non posso sapere quando verrà eseguito il test
        const jsonBody = JSON.parse(result.body);
        response201.creationDate = jsonBody.creationDate;
        response201.modificationDate = jsonBody.modificationDate;
        response201.versionedTranslations[0].modificationDate = jsonBody.versionedTranslations[0].modificationDate;

        expect(jsonBody).toEqual(response201);
        expect(result.statusCode).toEqual(201);
    });

    const response200 = {translationKey: "key", defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello",
    translations: [{language: "it", content: "ciao 2"}, {language: "en", content: "hello 2"} ],
    creationDate: "", modificationDate: "",
    modifiedbyUser: "email@email.com", published: false, versionedTranslations: [{modificationDate: "",
    modifiedbyUser: "email@email.com", translations: [{language: "it", content: "ciao"},
    {language: "en", content: "hello"}], published: true }, {modificationDate:"", modifiedbyUser: "email@email.com", translations: [{language: "it", content: "ciao 2"}, {language: "en", content: "hello 2"} ], published: false}]
    }

    const body200 = {defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao 2"}, { language: "en", content: "hello 2"}], modifiedbyUser: "email@email.com",
        published: false
    }

    it('200 modified', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslation(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);

        const result: any = await logic(body200, pathParameters200, "email", false);

        const jsonBody = JSON.parse(result.body);
        response200.creationDate = jsonBody.creationDate;
        response200.modificationDate = jsonBody.modificationDate;
        response200.versionedTranslations[0].modificationDate = jsonBody.versionedTranslations[0].modificationDate;
        response200.versionedTranslations[1].modificationDate = jsonBody.versionedTranslations[1].modificationDate;

        expect(JSON.parse(result.body)).toEqual(response200);
        expect(result.statusCode).toEqual(200);
    });
    
    const body400DefLangNotInList = { defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "fr", content: "boh"}], modifiedbyUser: "email@email.com",
        published: true
    };

    it('400 defaultLang not in translations', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result = await logic(body400DefLangNotInList, pathParameters200, "email", false);
        expect(JSON.parse(result.body)).toEqual({ error: "defaultTranslationLanguage must be in translations" });
        expect(result.statusCode).toEqual(400);
    })

    const body400DuplicatesInTranslations = { defaultTranslationLanguage: "it", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "it", content: "ciao"}], modifiedbyUser: "email@email.com",
        published: true
    };

    it('400 duplicates in translations', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result = await logic(body400DuplicatesInTranslations, pathParameters200, "email", false);
        expect(JSON.parse(result.body)).toEqual({ error: "translations must not contain duplicates" });
        expect(result.statusCode).toEqual(400);
    });

    it('400 tenant not found', async () => {
        setupMock_getTenantError(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result = await logic(body201, pathParameters200, "email", false);
        expect(JSON.parse(result.body)).toEqual({ error: "Tenant not found" });
        expect(result.statusCode).toEqual(400);
    });

    const body400DefLangNotOk = { defaultTranslationLanguage: "it", defaultTranslationinLanguage: "hello", translations: [
        {language: "it", content: "ciao"}, { language: "en", content: "hello"}], modifiedbyUser: "email@email.com",
        published: true
    };

    it('400 defaultLang not correct', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result: any = await logic(body400DefLangNotOk, pathParameters200, "email", false);
        expect(JSON.parse(result.body)).toEqual({ error: "DefaultTranslationLanguage is not correct" });
        expect(result.statusCode).toEqual(400);
    });

    const body400LangNotAvailable = { defaultTranslationLanguage: "en", defaultTranslationinLanguage: "hello", translations: [
        {language: "fr", content: "ciao"}, { language: "en", content: "hello"}], modifiedbyUser: "email@email.com",
        published: true
    };

    it('400 lang not available', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result: any = await logic(body400LangNotAvailable, pathParameters200, "email", false);
        expect(JSON.parse(result.body)).toEqual({ error: "Language fr is not available" });
        expect(result.statusCode).toEqual(400);
    });

    it('400 user not found', async () => {
        setupMock_getTenant(ddbMock);
        setupMock_getUserError(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        setupMock_putItem(ddbMock);
        const result: any = await logic(body201, pathParameters200, "email", false);
        expect(JSON.parse(result.body)).toEqual({ error: "User not found" });
        expect(result.statusCode).toEqual(400);
    });

    const pathParameters400ManyTransl = {
        tenantId: "tenant1",
        translationKey: "key"
    }

    it('400 too many translations', async () => {
        setupMock_getTenant5Translations(ddbMock);
        setupMock_getUser(ddbMock);
        setupMock_getTranslationError(ddbMock);
        setupMock_getAll5Translations(ddbMock);
        const result: any = await logic(body201, pathParameters400ManyTransl, "email", false);

        expect(JSON.parse(result.body)).toEqual({ error: "Translation limit reached" });
        expect(result.statusCode).toEqual(400);
    });
});