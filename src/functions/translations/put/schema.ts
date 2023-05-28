export default {
	type: "object",
	properties: {
		defaultTranslationLanguage: { type: "string"},
		defaultTranslationinLanguage: { type: "string"},
		translations: {
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
		},
		published: { type: "boolean"},
	},
	required: [
		"defaultTranslationLanguage",
		"defaultTranslationinLanguage",
		"translations",
		"published",
	],
} as const;
