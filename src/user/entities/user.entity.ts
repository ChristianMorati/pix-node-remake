import { Account } from "src/account/entities/account.entity";
import BaseEntity from "src/base_entity/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";


@Entity()
export class User extends BaseEntity {
    @Column()
    name: string

    @Column({ unique: true })
    username: string

    @Column()
    password: string

    @Column({ unique: true, nullable: true })
    cpf: string

    @OneToOne(() => Account)
    @JoinColumn()
    account?: Account;

    constructor(user: Partial<User>) {
        super();
        this.name = user?.name ?? '';
        this.username = user?.username ?? '';
        this.password = user?.password ?? '';
        this.cpf = user?.cpf ?? '';
        this.account = user?.account ?? null;
    }
}