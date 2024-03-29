require('dotenv').config()

interface Environment {
	awsRegion:
	| "us-east-1"
	| "us-east-2"
	| "us-gov-east-1"
	| "us-gov-west-1"
	| "us-iso-east-1"
	| "us-iso-west-1"
	| "us-isob-east-1"
	| "us-west-1"
	| "us-west-2"
	| "af-south-1"
	| "ap-east-1"
	| "ap-northeast-1"
	| "ap-northeast-2"
	| "ap-northeast-3"
	| "ap-south-1"
	| "ap-southeast-1"
	| "ap-southeast-2"
	| "ap-southeast-3"
	| "ca-central-1"
	| "cn-north-1"
	| "cn-northwest-1"
	| "eu-central-1"
	| "eu-central-2"
	| "eu-north-1"
	| "eu-south-1"
	| "eu-south-2"
	| "eu-west-1"
	| "eu-west-2"
	| "eu-west-3"
	| "me-central-1"
	| "me-south-1"
	| "sa-east-1";
	dynamo: {
		translations: {
			tableName: string;
			arn: string;
		},
	};
	lambda: {
		subnets: string[];
		securityGroupIds: string[];
	};
	cognito: {
		userPoolArn: string;
	};
}

const environment: Environment = {
	awsRegion: "eu-central-1",
	dynamo: {
		translations: {
			tableName: "translations",
			arn: process.env.DYNAMO_TRANSLATIONS_ARN
		},
	},
	lambda: {
		subnets: [

		],
		securityGroupIds: [],
	},
	cognito: {
		userPoolArn: process.env.COGNITO_ARN
	},
};

export { environment, Environment };
