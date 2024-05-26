import { PaymentService } from '../service/payment.service';
import { Response } from 'express';
import { Body, Controller, HttpStatus, Post, Res, Param, Get } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) { }

    @Post('intent')
    async makeIntent(@Body() intent: any, @Res() res: Response) {
        let paymentIntent;
        try {
            paymentIntent = await this.paymentService.makeIntent({
                amount: intent.amount,
                username: intent.username,
            })
            res.status(HttpStatus.OK).json(paymentIntent).send();
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error);
        }
    }

    @Post('customers/create')
    async createCustomer(@Body() customer: any, @Res() res: Response) {
        try {
            const response = await this.paymentService.createCustomer(customer.username);
            res.status(HttpStatus.CREATED).json(response).send();
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error);
        }
    }

    @Post('customers/:id/sources')
    async createCart(@Body() body: any, @Param() params: any, @Res() res: Response) {
        try {
            const response = await this.paymentService.setUpCreditCard(params.id, body.source);
            res.status(HttpStatus.CREATED).json(response).send();
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error);
        }
    }

    @Get('customers/email')
    async getCustomer(@Body() body: any, @Res() res: Response) {
        try {
            const response = await this.paymentService.findCustomerByEmail(body.email);
            res.status(HttpStatus.OK).json(response).send();
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(error);
        }
    }

    // @Post('customers/email')
    // async getCustomer(@Body() body: any, @Res() res: Response) {
    //     try {
    //         const response = await this.paymentService.findCustomerByEmail(body.email);
    //         res.status(HttpStatus.OK).json(response).send();
    //     } catch (error) {
    //         res.status(HttpStatus.BAD_REQUEST).json(error);
    //     }
    // }
}