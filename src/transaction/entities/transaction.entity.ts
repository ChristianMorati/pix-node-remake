import { Entity, Column } from 'typeorm';
import { TransactionType } from '../enum/transaction-type.enum';
import BaseEntity from 'src/base_entity/base.entity';

@Entity()
export class Transaction extends BaseEntity {
    @Column({ type: 'float' })
    amount: number;

    @Column()
    payeePixKeyType: string;

    @Column()
    payerUserId: number;

    @Column({ nullable: true })
    payeePixKey: string;

    @Column()
    accountId: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column()
    success: boolean;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    constructor(transaction: Partial<Transaction>) {
        super();
        this.amount = transaction?.amount ?? 0;
        this.payeePixKeyType = transaction?.payeePixKeyType ?? null;
        this.payerUserId = transaction?.payerUserId ?? null;
        this.payeePixKey = transaction?.payeePixKey ?? null;
        this.accountId = transaction?.accountId ?? null;
        this.success = transaction?.success ?? false;
        this.type = transaction?.type ?? TransactionType.TRANSACTION;
    }
}
