import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('auths')
export class Auth {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string
    
}
