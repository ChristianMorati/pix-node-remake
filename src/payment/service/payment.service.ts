import { Injectable } from '@nestjs/common';

export type IntentOptions = {
    amount: number,
    username: string
}

@Injectable()
export class PaymentService {
    private readonly stripe = require('stripe')(process.env.STRIPE_KEY);

    constructor(
    ) { }

    async findCustomerByEmail(email: string) {
        try {
            const customer = await this.stripe.customers.list({
                email: email,
                limit: 1
            });
            if (customer.data.length !== 0) {
                return customer.data[0].id;
            }
        } catch (e) {
            return (e);
        }
    };

    async createCustomer(username: string) {
        let customer;
        let ephemeralKey;

        try {
            customer = await this.findCustomerByEmail(username);

            if (!customer) {
                customer = await this.stripe.customers.create({
                    email: username,
                });
            }

            // if (customer) {
            //     ephemeralKey = await this.stripe.ephemeralKeys.create({
            //         customer
            //     })

            //     console.log('ephemeralKey: ', ephemeralKey)
            // }

            console.error(customer)

            return {
                customer: customer,
                // ephemeralKey: ephemeralKey,
            }

        } catch (e) {
            console.error(e)
            throw e;
        }
    }

    async makeIntent({ amount, username }: IntentOptions) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amount,
                currency: 'brl',
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return {
                paymentIntent: paymentIntent.client_secret,
            }
        } catch (error) {
            throw ({ "error": "An error was ocurred on make Paynment Intent!\n" + error.message })
        }
    }

    async setUpCreditCard(customerId: string, cardData: any) {
        try {

            const id = customerId.replace(" ", "_");
            const cardToCreate = { "source": { ...cardData } }

            const customerSource = await this.stripe.customers.createSource(id, cardToCreate);

            return {
                data: customerSource
            }
        } catch (e) {
            throw e;
        }
    }
}
