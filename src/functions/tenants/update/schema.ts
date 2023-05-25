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
	required: [],
} as const;
