import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/denverwestern/entities/order.entity';
import { OrderItem } from 'src/denverwestern/entities/order-item.entity';
import { Cart } from 'src/denverwestern/entities/cart.entity';
import { User } from  'src/denverwestern/entities/user.entity';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, status: 'OPEN' },
      relations: ['items', 'items.product']
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Crear la orden
    const order = this.orderRepository.create({
      user,
      total: await this.calculateCartTotal(cart),
      status: 'PENDING',
      paymentMethod: createOrderDto.paymentMethod,
    });

    // Crear items de la orden
    const orderItems = cart.items.map(cartItem =>
      this.orderItemRepository.create({
        order,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.price,
      })
    );

    await this.orderRepository.save(order);
    await this.orderItemRepository.save(orderItems);

    // Actualizar el carrito a COMPLETED
    cart.status = 'COMPLETED';
    await this.cartRepository.save(cart);

    return this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['items', 'items.product']
    });
  }

  private async calculateCartTotal(cart: Cart): Promise<number> {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product']
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async getUserOrderHistory(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }
}