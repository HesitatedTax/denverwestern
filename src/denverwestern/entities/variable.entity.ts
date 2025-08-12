import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Variable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  size: string;

  @Column()
  stock: number;

  @ManyToOne(() => Product, product => product.variables)
  product: Product;
}