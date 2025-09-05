import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { VariablesModule } from './modules/variables/variables.module';
import { OrderItemModule } from './modules/order-item/order-item.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  
    TypeOrmModule.forRootAsync({  
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Quebueno1',  
        database: 'denverwestern',
        autoLoadEntities: true, 
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),  AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    VariablesModule,
    CartModule,
    OrdersModule,
    OrderItemModule,
  ],
})
export class AppModule {}