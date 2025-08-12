import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  
import { ConfigModule, ConfigService } from '@nestjs/config';  
import { ProductsModule } from './products/products.module';

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
    }), ProductsModule,
  ],
})
export class AppModule {}