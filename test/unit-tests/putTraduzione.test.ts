var request = require('superagent');

describe('Tenant: API PUT', () => {
    /*
    beforeAll(async() => {
        // API DELETE TENANT
    });

    afterAll(async() => {
        // API DELETE TENANT
    });*/

    it('Response ok', async() => {
        const response = await request.put("http://localhost:3000/dev/tenant1/translation/traduzione1")
            .set('Authorization','Bearer test')
            .send({
                "linguaTraduzioneDefault": "it",
                "traduzioneinLinguaDefault": "ciao",
                "traduzioni": [
                    {
                        "language": "it",
                        "content": "ciao"
                    },
                    {
                        "language": "en",
                        "content": "hello"
                    }
                ],
                "modificatodaUtente": "utente1",
                "pubblicato": false
            });
        expect(response.body).toMatchObject(
            {
                "newTranslation": {
                    "tenantId": "TRAD#tenant1",
                    "KeySort": "TRAD#tenant1#traduzione1",
                    "linguaTraduzioneDefault": "it",
                    "traduzioneinLinguaDefault": "ciao",
                    "traduzioni": [
                        {
                            "language": "it",
                            "content": "ciao"
                        },
                        {
                            "language": "en",
                            "content": "hello"
                        }
                    ],
                    "modificatodaUtente": "utente1",
                    "pubblicato": false
                }
            }
        );
        expect(response.statusCode).toBe(200);
    });

    it('Response NOT ok', async() => {
        await request.put("http://localhost:3000/dev/tenant1/translation/traduzione1")
            .set('Authorization','Bearer test')
            .send({
                "linguaTraduzioneDefault": "it",
                "traduzioneinLinguaDefault": "ciao",
                "traduzioni": [
                    {
                        "language": "it",
                        "content": "ciao"
                    },
                    {
                        "language": "en",
                        "content": "hello"
                    }
                ],
                "modificatodaUtente": "utente1",
                "pubblicato": false
            }
        ).catch(err => {
            expect(err.status).toBe(400);
        });
    });
});