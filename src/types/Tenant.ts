interface Tenant {
	tenantId: string
	keySort: string
	tenantName: string
	numberTranslationAvailable: number
	numberTranslationUsed: number
	defaultTranslationLanguage: string
	listAvailableLanguages: string[]
	token: string
}

export { Tenant };