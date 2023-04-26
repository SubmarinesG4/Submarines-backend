export default {
	type: "object",
	properties: {
		tenantId: { type: "string" },
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
		"tenantId",
		"nomeTenant",
		"numeroTraduzioniDisponibili",
		"linguaTraduzioneDefault",
		"listaLingueDisponibili"
	],
} as const;
