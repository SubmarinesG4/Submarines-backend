
interface Translation {
	tenantId: string
	keySort: string
	linguaTraduzioneDefault: string
	traduzioneinLinguaDefault: string
	traduzioni: { language: string, content: string }[]
	modificatodaUtente: string
	dataCreazione: string
	dataModifica: string
	pubblicato: boolean;
}

export { Translation };
