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
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
		},
		vpc: {
			securityGroupIds: environment.lambda.securityGroupIds,
			subnetIds: environment.lambda.subnets,
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
						],
						Resource: [
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
					},{
						AttributeName: 'nomeTenant',
						AttributeType: 'S',
					}],
					KeySchema: [{
						AttributeName: 'tenantId',
						KeyType: 'HASH',
					}, {
						AttributeName: 'keySort',
						KeyType: 'RANGE',
					}],
					GlobalSecondaryIndexes: [{
						IndexName: 'keySortIndex', //! TO GET ALL TENANTS
						KeySchema: [{
							AttributeName: 'keySort',
							KeyType: 'HASH',
						}, {
							AttributeName: 'nomeTenant',
							KeyType: 'RANGE',
						}],
						Projection: {
							ProjectionType: 'ALL',
						}
					}]
				},
			},
		}
	},
	// import the function via paths
	functions: { translationGet, translationPut, translationGetAll, tenantPut, getTenant, inviteUser, deleteUser, deleteTenant, tenantsGetAll, translationDelete, libraryGet, updateTenant, },
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
		dynamodb: {
			stages: ['dev'],
			start: {
				migrate: true,
			},
		},
	},
};

module.exports = serverlessConfiguration;
