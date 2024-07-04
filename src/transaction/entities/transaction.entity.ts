import { Entity, Column } from 'typeorm';
import { TransactionType } from '../enum/transaction-type.enum';
import BaseEntity from 'src/base_entity/base.entity';

@Entity()
export class Transaction extends BaseEntity {
    @Column({ type: 'float' })
    amount: number;

    @Column()
    payerUserId: number;

    @Column({ nullable: true })
    payeePixKeyType: string;

    @Column({ nullable: true })
    payeePixKey: string;

    @Column()
    accountId: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column()
    success: boolean;

    @Column({ type: 'text', nullable: true })
    type: TransactionType;

    constructor(transaction: Partial<Transaction>) {
        super();
        this.amount = transaction?.amount ?? 0;
        this.payeePixKeyType = transaction?.payeePixKeyType ?? null;
        this.payerUserId = transaction?.payerUserId ?? null;
        this.payeePixKey = transaction?.payeePixKey ?? null;
        this.accountId = transaction?.accountId ?? null;
        this.type = transaction?.type ?? null;
        this.success = transaction?.success ?? false;
    }
}
