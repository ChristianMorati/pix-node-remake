
export class PixKey {
    constructor(public readonly key: string) {
        if (!this.isValidKey(key)) {
            throw new Error('Invalid PIX key format');
        }
    }

    protected isValidKey(key: string): boolean {
        if (typeof key !== "string") { return false }
        return true;
    }
}

export class EmailKey extends PixKey {
    constructor(key: string) {
        super(key);
        if (!this.isValidEmail(key)) {
            throw new Error('Invalid email format');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export class CpfKey extends PixKey {
    constructor(key: string) {
        super(key);
        if (!this.isValidcpf(key)) {
            throw new Error('Invalid cpf format');
        }
    }

    private isValidcpf(cpf: string): boolean {
        const cpfRegex = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$/;
        return cpfRegex.test(cpf);
    }
}

export class PhoneKey extends PixKey {
    constructor(key: string) {
        super(key);
        if (!this.isValidcpf(key)) {
            throw new Error('Invalid cpf format');
        }
    }

    private isValidcpf(cpf: string): boolean {
        const cpfRegex = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$/;
        return cpfRegex.test(cpf);
    }
}

export type AccountPixKeys = [
    { email?: EmailKey },
    { cpf?: CpfKey },
    { phone?: PhoneKey },
]