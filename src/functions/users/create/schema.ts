export default {
	type: "object",
	properties: {
		emailUtente: { type: "string" },
		username: { type: "string" },
	},
	required: [
		"emailUtente",
		"username"
	],
} as const;
