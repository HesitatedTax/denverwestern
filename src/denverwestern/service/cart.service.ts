import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/denverwestern/entities/cart.entity';
import { CartItem } from 'src/denverwestern/entities/cart-item.entity';
import { Product } from 'src/denverwestern/entities/product.entity';
import { User } from 'src/denverwestern/entities/user.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOrCreateUserCart(userId: string): Promise<Cart> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, status: 'OPEN' },
      relations: ['items', 'items.product']
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user,
        status: 'OPEN',
        items: []
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    const cart = await this.getOrCreateUserCart(userId);
    const product = await this.productRepository.findOne({ where: { id: productId } });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.items.find(item => item.product.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        price: product.price
      });
      cart.items.push(newItem);
      await this.cartItemRepository.save(newItem);
    }

    return this.cartRepository.save(cart);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getOrCreateUserCart(userId);
    
    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
    if (itemIndex === -1) {
      throw new NotFoundException('Ítem no encontrado en el carrito');
    }

    await this.cartItemRepository.remove(cart.items[itemIndex]);
    cart.items.splice(itemIndex, 1);

    return this.cartRepository.save(cart);
  }

  async updateItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateUserCart(userId);
    
    const item = cart.items.find(item => item.id === cartItemId);
    if (!item) {
      throw new NotFoundException('Ítem no encontrado en el carrito');
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, cartItemId);
    }

    item.quantity = quantity;
    await this.cartItemRepository.save(item);

    return this.cartRepository.save(cart);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateUserCart(userId);
    
    await this.cartItemRepository.remove(cart.items);
    cart.items = [];
    
    await this.cartRepository.save(cart);
  }

  async getCartTotal(cart: Cart): Promise<number> {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}