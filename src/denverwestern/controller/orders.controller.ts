import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './../service/orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/denverwestern/entities/user.entity';
import { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user['userId'];
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  async getUserOrders(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.ordersService.getUserOrderHistory(userId);
  }

  @Get(':id')
  async getOrder(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['userId'];
    return this.ordersService.findOne(id, userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllOrders() {
    return this.ordersService.findAll();
  }

  @Post('admin/update-status/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}