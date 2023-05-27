import { logic } from '../../src/functions/library/get/handler';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { setupMock_getTenantByToken, setupMock_getTenantTranslations } from '../dynamoMocks';

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

describe('Get translation Library', function () {

    const pathParamsOk = {
        "token": "provatoken",
        "language": "en"
    }

    const response = {
        translations: {
            key: "hello",
        }
    };

    it('200 success', async () => {
        setupMock_getTenantByToken(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        const result: any = await logic(pathParamsOk);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(response);
    });

    const pathParamsNo = {
        "token": "provatoken",
        "language": "fr"
    }

    const response404 = {  
        error: "Lingua non disponibile"
    }

    it('404 lingua non disponibile', async () => {
        setupMock_getTenantByToken(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        const result: any = await logic(pathParamsNo);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual(response404);
    });

    const pathParamsNo2 = {
        "token": "provatokensbagliato",
        "language": "en"
    }

    const response400 = {  
        error: "Token non valido"
    }

    it('400 token non valido', async () => {
        setupMock_getTenantByToken(ddbMock);
        setupMock_getTenantTranslations(ddbMock);
        const result: any = await logic(pathParamsNo2);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual(response400);
    });
});