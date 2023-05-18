export default {
	type: "object",
	properties: {
		userEmail: { type: "string" },
		username: { type: "string" },
		name: { type: "string" },
		surname: { type: "string" },
	},
	required: [
		"userEmail",
		"username",
		"name",
		"surname"
	],
} as const;
