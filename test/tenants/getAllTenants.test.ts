import { logic } from '../../src/functions/tenants/getAll/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_GetAllTenants} from '../dynamoMocks';

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



describe('get alltenants', function () {

    const rightreponse = { 
        "tenants": [{
        numberTranslationAvailable: 100,
        tenantName: 'tenant1',
        defaultTranslationLanguage: 'en'
    }]
    }
    

    it('200 success senza parametri ', async () => {
        setupMock_GetAllTenants(ddbMock);
        const result: any = await logic({});
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(rightreponse);
    });

    const queryStringParameters = { word: "tenant1"};
    

    it('200 success con parametri ', async () => {
        setupMock_GetAllTenants(ddbMock);
        const result: any = await logic(queryStringParameters);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(rightreponse);
    });
});
