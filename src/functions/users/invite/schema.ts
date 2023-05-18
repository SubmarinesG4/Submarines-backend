export default {
	type: "object",
	properties: {
		userEmail: { type: "string" },
		username: { type: "string" },
		name: { type: "string" },
		lastName: { type: "string" },
	},
	required: [
		"userEmail",
		"username",
		"name",
		"lastName"
	],
} as const;
