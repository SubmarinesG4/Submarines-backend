interface Tenant {
	tenantId: string
	KeySort: string
	tenantName: string
	numberTranslationAvailable: number
	numberTranslationUsed: number
	defaultTranslationLanguage: string
	listAvailableLanguages: string[]
	token: string
}

export { Tenant };