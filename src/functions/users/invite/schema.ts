export default {
	type: "object",
	properties: {
		userEmail: { type: "string" },
	},
	required: [
		"userEmail"
	],
} as const;
