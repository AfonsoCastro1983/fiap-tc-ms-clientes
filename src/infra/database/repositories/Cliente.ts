import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ClienteRepository {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    idcognito!: string;
    @Column()
    nome!: string;
    @Column()
    cpf!: string;
    @Column()
    email!: string;
    @Column()
    ultima_modificacao!: Date;
}