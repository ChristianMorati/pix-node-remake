import { BadRequestException } from "@nestjs/common";

class PayerAccountNotFound extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = 'PayerAccountNotFound';
    }
}

class PayeeAccountNotFound extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = 'PayeeAccountNotFound';
    }
}

class SameAccountPayee extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = 'PayeeAccountNotFound';
    }
}

class InsufficientFundsError extends BadRequestException {
    constructor(message: string) {
        super(message);
        this.name = 'InsufficientFundsError';
    }
}

export {
    InsufficientFundsError,
    PayeeAccountNotFound,
    PayerAccountNotFound,
    SameAccountPayee,
}