interface Tenant {
	tenantId: string,
	KeySort: string,
	nomeTenant: string
	numeroTraduzioniDisponibili: number
	numeroTraduzioniUsate: number
	linguaTraduzioneDefault: string
	listaLingueDisponibili: string[]
	token: string
}

export { Tenant };