import AWS from 'aws-sdk';
require('dotenv').config()

export class CognitoHandler {

    private static instance: CognitoHandler;
    private cognito: AWS.CognitoIdentityServiceProvider;

    //* Cognito client configuration
    private constructor() {
        this.cognito = new AWS.CognitoIdentityServiceProvider({
            region: "eu-central-1",
            credentials: {
                accessKeyId: process.env.Access_key_ID, //* IAM access ID
                secretAccessKey: process.env.Secret_access_key, //* IAM Secret
            }
        });
    }

    //*  Singleton
    static getInstance(): CognitoHandler {
        if (!this.instance) {
            this.instance = new CognitoHandler();
        }
        return this.instance;
    }

    createUser (username: string, email: string, name: string, surname: string) {
        const params = {
            UserPoolId: "eu-central-1_OcyZlYZEj",
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                },
                {
                    Name: 'family_name',
                    Value: surname
                },
                {
                    Name: 'given_name',
                    Value: name
                }
            ]
        };
        this.cognito.adminCreateUser(params, function (err, result) {
            if (err) {
                console.log('err:', err);
                throw err;
            } else {
                console.log('result:', result);
                console.log('User created successfully');
            }
        });
    }

    addUserToGroup (email: string, group: string){
        var params = {
            GroupName: group, 
            UserPoolId: "eu-central-1_OcyZlYZEj", 
            Username: email
          };
          this.cognito.adminAddUserToGroup(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });
    }

    deleteUser (username: string) {
        try {
            var params = {
                UserPoolId: "eu-central-1_OcyZlYZEj", /* required */
                Username: username /* required */
            };
            this.cognito.adminDeleteUser(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    throw err; 
                }
                else
                    console.log(data);
            });
        } catch (e) {
            throw e;
        }
    }

    getUser (username: string) {
        return new Promise((resolve, reject) => {
            this.cognito.adminGetUser({
                UserPoolId: "eu-central-1_OcyZlYZEj",
                Username: username
            }, (err, data) => {
                if (err)
                    reject(err.stack);
                else
                    resolve(data.UserAttributes[2].Value);
            });
        });
    }
}