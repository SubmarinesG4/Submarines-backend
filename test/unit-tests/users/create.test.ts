var request = require('superagent');

describe('Tenant: API PUT', () => {

    beforeAll(async() => {
        // API DELETE TENANT
    });

    afterAll(async() => {
        // API DELETE TENANT
    });

    it('Response ok', async() => {
        const response = await request.post("http://localhost:3000/dev/tenant5/user")
            .set('Authorization','Bearer test')
            .send({
                "emailUtente": "teswddt@gmail.com",
                "username": "testest"
            });
        expect(response.body).toMatchObject(
            {
                "newUser": {
                    "tenantId": "TRAD#tenant5",
                    "KeySort": "USER#testest",
                    "emailUtente": "teswddt@gmail.com",
                    "username": "testest"
                }
            }
        );
        expect(response.statusCode).toBe(200);
    });
    
    it('Response NOT ok', async() => {
        await request.post("http://localhost:3000/dev/tenant5/user")
            .set('Authorization','Bearer test')
            .send({
                "emailUtente": "teswddt@gmail.com"
            }
        ).catch(err => {
            expect(err.status).toBe(400);
        });
    });
});