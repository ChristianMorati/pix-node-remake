export class CreatePixKeyDto {
    accountId: number
    type: 'phone' | 'cpf' | 'email' | 'randomKey'
    value: string
    is_active: boolean
}