import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';
import { Variable } from './variable.entity';

export enum ProductType {
  BOOTS = 'BOTAS',
  BELTS = 'CINTURONES',
  SHIRTS = 'CAMISAS',
  HATS = 'GORRAS',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn()
  category: Category;

  @ManyToMany(() => Variable)
  @JoinTable()
  variables: Variable[];
}