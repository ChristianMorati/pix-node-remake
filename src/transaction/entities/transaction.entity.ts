import { Account } from "src/account/entities/account.entity";
import BaseEntity from "src/base_entity/base.entity";
import { Column, Entity, JoinTable, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Transaction extends BaseEntity {
    @Column()
    amount: number;

    @Column()
    payerUserId: number;

    @Column()
    payeePixKey: string

    @Column()
    accountId: number;

    @Column({ type: "date" })
    date?: Date;

    @Column()
    success: boolean

    constructor(transaction: Partial<Transaction>) {
        super();
        this.amount = transaction?.amount ?? 0;
        this.payerUserId = transaction?.payerUserId ?? null;
        this.payeePixKey = transaction?.payeePixKey ?? null;
        this.accountId = transaction?.accountId ?? null;
        this.date = transaction?.date ?? new Date();
        this.success = transaction?.success ?? false;
    }
}