export default {
	type: "object",
	properties: {
		nomeTenant: { type: "string" },
		numeroTraduzioniDisponibili: { type: "number" },
		linguaTraduzioneDefault: { type: "string" },
		listaLingueDisponibili: {
			type: "array",
			items: {
				type: "string"
			}
		}
	},
	required: [
		"nomeTenant",
		"numeroTraduzioniDisponibili",
		"linguaTraduzioneDefault",
		"listaLingueDisponibili"
	],
} as const;
