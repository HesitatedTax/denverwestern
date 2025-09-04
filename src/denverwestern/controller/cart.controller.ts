import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './../service/cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.cartService.getOrCreateUserCart(userId);
  }

  @Post('add-item')
  async addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user['userId'];
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Put('update-item/:itemId')
  async updateItemQuantity(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto
  ) {
    const userId = req.user['userId'];
    return this.cartService.updateItemQuantity(userId, itemId, updateDto.quantity);
  }

  @Delete('remove-item/:itemId')
  async removeFromCart(@Req() req: Request, @Param('itemId') itemId: string) {
    const userId = req.user['userId'];
    return this.cartService.removeFromCart(userId, itemId);
  }

  @Delete('clear')
  async clearCart(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.cartService.clearCart(userId);
  }
}