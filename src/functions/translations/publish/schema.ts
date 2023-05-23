export default {
	type: "object",
	properties: {
		publish: { type: "boolean" },
	},
	required: [
		"publish",
	],
} as const;
