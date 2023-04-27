const request = require('superagent');
const app = require("../../src/functions/translations/getAll/index");

describe('Space test suite', () => {
    it('tests /destinations endpoints', async() => {
        
        const response = await request.get("http://localhost:3000/dev/translation/tenant3").set('Authorization','Bearer test');
        expect(response.body).toEqual({"items":[]});
        expect(response.statusCode).toBe(200);
        // Testing a single element in the array
        
        //expect(true).toBe(true);

    });

    // Insert other tests below this line

    // Insert other tests above this line
});