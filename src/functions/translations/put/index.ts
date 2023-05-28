import { handlerPath } from '@libs/handler-resolver';
import { environment } from 'src/environment/environment';
import schema from './schema';

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: 'PUT',
				path: '{tenantId}/translation/{translationKey}',
				request: {
					schemas: {
						"application/json": schema,
					},
				},
				authorizer: {
					arn: environment.cognito.userPoolArn,
				},
				cors: true,
			},

		},
	],
};
