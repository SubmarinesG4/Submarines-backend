import { handlerPath } from '@libs/handler-resolver';
import schema from './schema';

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: 'POST',
				path: '{tenantId}/translations/{translationKey}/publish',
				request: {
					schemas: {
						"application/json": schema,
					},
				},
			},
		},
	],
};
