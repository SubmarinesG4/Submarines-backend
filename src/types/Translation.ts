interface Translation {
	tenantId: string
	keySort: string
	translationKey: string
	defaultTranslationLanguage: string
	defaultTranslationinLanguage: string
	translations: { language: string, content: string }[]
	creationDate: string
	modificationDate: string
	modifiedbyUser: string
	published: boolean;
	versionedTranslations: Version[]
}

interface Version {
	modificationDate: string,
	modifiedbyUser: string,
	translations: { language: string, content: string }[]
	published: boolean;
}

export { Translation, Version };
