export default {
	type: "object",
	properties: {
		tenantName: { type: "string" },
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
		"tenantName",
		"numberTranslationAvailable",
		"defaultTranslationLanguage",
		"listAvailableLanguages"
	],
} as const;
