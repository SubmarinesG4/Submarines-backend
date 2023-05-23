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
		modifiedbyUser: { type: "string"},
		published: { type: "boolean"},
	},
	required: [
		"defaultTranslationLanguage",
		"defaultTranslationinLanguage",
		"translations",
		"modifiedbyUser",
		"published",
	],
} as const;
