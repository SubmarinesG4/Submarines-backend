export default {
	type: "object",
	properties: {
		userEmail: { type: "string" },
		username: { type: "string" },
		name: { type: "string" },
		lastName: { type: "string" },
		role: { type: "string" },
	},
	required: [
		"userEmail",
		"username",
		"name",
		"lastName",
		"role"
	],
} as const;
