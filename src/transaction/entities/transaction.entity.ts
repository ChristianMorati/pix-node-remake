import { Account } from "src/account/entities/account.entity";
import BaseEntity from "src/base_entity/base.entity";
import { Column, Entity, JoinTable, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Transaction extends BaseEntity {
    @Column({ type: 'float' })
    amount: number;

    @Column()
    payerUserId: number;

    @Column({ nullable: true })
    payeePixKey: string

    @Column()
    accountId: number;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column()
    success: boolean

    constructor(transaction: Partial<Transaction>) {
        super();
        this.amount = transaction?.amount ?? 0;
        this.payerUserId = transaction?.payerUserId ?? null;
        this.payeePixKey = transaction?.payeePixKey ?? null;
        this.accountId = transaction?.accountId ?? null;
        this.success = transaction?.success ?? false;
    }
}