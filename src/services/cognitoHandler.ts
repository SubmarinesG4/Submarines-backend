import AWS from 'aws-sdk';
require('dotenv').config()

export class CognitoHandler {
	private static instance: CognitoHandler;
	private cognito: AWS.CognitoIdentityServiceProvider;

	//* Cognito client configuration
	private constructor() {
		this.cognito = new AWS.CognitoIdentityServiceProvider({
			region: "eu-central-1",
		});
	}

	//*  Singleton
	static getInstance(): CognitoHandler {
		if (!this.instance) {
			this.instance = new CognitoHandler();
		}
		return this.instance;
	}

	async createUser(email: string, name: string, surname: string, tenantId: string, role: string) {
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
				},
				{
					Name: 'custom:tenantId',
					Value: tenantId
				}
			]
		};
		await this.cognito.adminCreateUser(params).promise();
		return await this.addUserToGroup(email, role)
	}

	async addUserToGroup(email: string, group: string) {
		var params = {
			GroupName: group,
			UserPoolId: "eu-central-1_OcyZlYZEj",
			Username: email
		};
		return await this.cognito.adminAddUserToGroup(params).promise();
	}

	deleteUser(username: string) {
		try {
			var params = {
				UserPoolId: "eu-central-1_OcyZlYZEj", /* required */
				Username: username /* required */
			};
			this.cognito.adminDeleteUser(params, function (err) {
				if (err) {
					console.log(err, err.stack);
					throw err;
				}
			});
		} catch (e) {
			throw e;
		}
	}

	getUser(username: string) {
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