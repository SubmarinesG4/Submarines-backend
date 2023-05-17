export default {
	type: "object",
	properties: {
		userEmail: { type: "string" },
		username: { type: "string" },
	},
	required: [
		"userEmail",
		"username"
	],
} as const;
