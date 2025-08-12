import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

export enum CartStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.carts)
  user: User;

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.OPEN })
  status: CartStatus;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => CartItem, item => item.cart)
  items: CartItem[];
}