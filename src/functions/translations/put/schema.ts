export default {
	type: "object",
	properties: {
		linguaTraduzioneDefault: { type: "string"},
		traduzioneinLinguaDefault: { type: "string"},
		traduzioni: {
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
		modificatodaUtente: { type: "string"},
		pubblicato: {type: "boolean"},
	},
	required: [
		"linguaTraduzioneDefault",
		"traduzioneinLinguaDefault",
		"traduzioni",
		"modificatodaUtente",
		"pubblicato",
	],
} as const;
