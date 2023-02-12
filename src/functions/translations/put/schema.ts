export default {
	type: "object",
	properties: {
		projectId: { type: "string" },
		translationKey: { type: "string" },
		languages: {
			type: "array",
			items: {
				type: "object",
				properties: {
					language: {
						type: "string",
					},
					content: {
						type: "string",
					}
				},
				required: ["language", "content"]
			}
		}
	},
	required: [
		"projectId",
		"translationKey",
		"languages",
	],
} as const;
