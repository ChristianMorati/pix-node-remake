import { Account } from "src/account/entities/account.entity";
import BaseEntity from "src/base_entity/base.entity";
import { Column, Entity, JoinTable, ManyToOne, PrimaryColumn, Unique } from "typeorm";

@Entity()
export class PixKey extends BaseEntity {
    @Column({ nullable: true })
    accountId: number

    @ManyToOne(() => Account, (account) => account.pixKeys)
    @JoinTable()
    account: Account;

    @Column()
    type: string |'email' | 'cpf' | 'cnpj' | 'phone';

    @Column()
    value: string;

    @Column({ default: false })
    is_active: boolean;

    constructor(pixKey: Partial<PixKey>) {
        super();
        this.accountId = pixKey?.accountId ?? null;
        this.type = pixKey?.type ?? null;
        this.value = pixKey?.value ?? null;
        this.is_active = pixKey?.is_active ?? true;
    }
}