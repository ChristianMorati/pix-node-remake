import BaseEntity from "src/base_entity/base.entity";
import { PixKey } from "src/pix-key/entities/pix-key.entity";
import { Column, Entity, JoinTable, OneToMany } from "typeorm";

@Entity()
export class Account extends BaseEntity {
    @Column({ type: 'float' })
    balance: number

    @Column({ nullable: true })
    userId: number;

    @OneToMany(() => PixKey, (pixKey) => pixKey.account, { onDelete: 'SET NULL', eager: true })
    @JoinTable()
    pixKeys?: PixKey[];

    constructor(account: Partial<Account>) {
        super();
        this.balance = account?.balance ?? 0;
        this.userId = account?.userId ?? null;
        this.pixKeys = account?.pixKeys ?? null;
    }

    deposit(amount: number) {
        this.balance += amount;
    }

    withdraw(amount: number) {
        this.balance -= amount;
    }
}