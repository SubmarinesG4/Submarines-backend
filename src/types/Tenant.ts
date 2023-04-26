import { User } from 'src/types/User';

interface Tenant {
	tenantId: string,
	KeySort: string,
	nomeTenant: string
	numeroTraduzioniDisponibili: number
	numeroTraduzioniUsate: number
	linguaTraduzioneDefault: string
	listaLingueDisponibili: string[]
	token: string
	listaUserTenant: User[]
}

export { Tenant };