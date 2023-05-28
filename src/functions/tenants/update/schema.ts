export default {
	type: "object",
	properties: {
		numberTranslationAvailable: { type: "number" },
		defaultTranslationLanguage: { type: "string" },
		listAvailableLanguages: {
			type: "array",
			items: {
				type: "string"
			}
		}
	},
	required: [
		"numberTranslationAvailable",
		"defaultTranslationLanguage",
		"listAvailableLanguages"
	],
} as const;
