import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
      TypeOrmModule.forFeature([
        Cart,
      ])
    ],
    exports: [
      CartService     
    ]
})
export class CartModule {}
