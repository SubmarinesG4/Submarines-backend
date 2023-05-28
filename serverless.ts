import type { AWS } from '@serverless/typescript';

import { environment } from 'src/environment/environment';

import {
	translationGet,
	translationPut,
	translationGetAll,
	tenantPut,
	getTenant,
	inviteUser,
	deleteUser,
	deleteTenant,
	tenantsGetAll,
	translationDelete,
	libraryGet,
	updateTenant,
	getLibraryTenantLanguages,
} from "@functions/index";

const serverlessConfiguration: AWS = {
	service: 'translate-api',
	frameworkVersion: '3',
	plugins: [
		'serverless-esbuild',
		'serverless-dynamodb-local',
		'serverless-offline'
	],
	provider: {
		name: 'aws',
		runtime: 'nodejs14.x',
		region: environment.awsRegion,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
		},
		iam: {
			role: {
				statements: [
					{
						Effect: "Allow",
						Action: [
							"dynamodb:BatchGetItem",
							"dynamodb:GetItem",
							"dynamodb:DeleteItem",
							"dynamodb:Query",
							"dynamodb:Scan",
							"dynamodb:BatchWriteItem",
							"dynamodb:PutItem",
							"dynamodb:UpdateItem",
							"dynamodb:Scan",
							"cognito-idp:AdminCreateUser",
							"cognito-idp:AdminAddUserToGroup",
							"cognito-idp:AdminDeleteUser",
							"cognito-idp:AdminGetUser",
						],
						Resource: [
							environment.cognito.userPoolArn,
							environment.dynamo.translations.arn,
						],
					},
				],
			},
		},
	},
	resources: {
		Resources: {
			translateTable: {
				Type: "AWS::DynamoDB::Table",
				Properties: {
					TableName: environment.dynamo.translations.tableName,
					BillingMode: "PAY_PER_REQUEST",
					AttributeDefinitions: [{
						AttributeName: 'tenantId',
						AttributeType: 'S',
					}, {
						AttributeName: 'keySort',
						AttributeType: 'S',
					}],
					KeySchema: [{
						AttributeName: 'tenantId',
						KeyType: 'HASH',
					}, {
						AttributeName: 'keySort',
						KeyType: 'RANGE',
					}]
				},
			},
		}
	},
	functions: {
		translationGet,
		translationPut,
		translationGetAll,
		tenantPut,
		getTenant,
		inviteUser,
		deleteUser,
		deleteTenant,
		tenantsGetAll,
		translationDelete,
		libraryGet,
		updateTenant,
		getLibraryTenantLanguages,
	},
	package: { individually: true },
	custom: {
		esbuild: {
			bundle: true,
			minify: false,
			sourcemap: true,
			exclude: ['aws-sdk'],
			target: 'node14',
			define: { 'require.resolve': undefined },
			platform: 'node',
			concurrency: 10,
		},
	},
};

module.exports = serverlessConfiguration;
