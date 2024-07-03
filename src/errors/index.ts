class PayerAccountNotFound extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PayerAccountNotFound';
    }
}

class PayeeAccountNotFound extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PayeeAccountNotFound';
    }
}

class InsufficientFundsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InsufficientFundsError';
    }
}

export {
    InsufficientFundsError,
    PayeeAccountNotFound,
    PayerAccountNotFound
}