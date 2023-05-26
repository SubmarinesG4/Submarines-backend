import { logic } from '../../src/functions/library/getLanguages/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenantByToken } from '../dynamoMocks';

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

describe('Get translation Library Languages', function () {

    const pathParamsOk = {
        token: "provatoken"
    }

    const response = {
        defaultLanguage: 'en',
        languages: ['en','it']
    };

    it('200 success', async () => {
        setupMock_getTenantByToken(ddbMock);
        const result: any = await logic(pathParamsOk);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(response);
    });

    const response404 = {  
        error: "Lingue non disponibili"
    }

    it('404 lingua non disponibile', async () => {
        setupMock_getTenantByToken(ddbMock);
        const result: any = await logic({
            token: "provatokenlingue"
        });
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual(response404);
    });

    const pathParamsNo2 = {
        "token": "provatokensbagliato"
    }

    const response400 = {  
        error: "Token non valido"
    }

    it('400 token non valido', async () => {
        setupMock_getTenantByToken(ddbMock);
        const result: any = await logic(pathParamsNo2);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual(response400);
    });
});