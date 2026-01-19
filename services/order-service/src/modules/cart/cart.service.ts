import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cart, CartStatus, CartItem } from '@/entities/cart.entity';
import {
  AddToCartDto,
  UpdateCartItemDto,
  SetShippingAddressDto,
  ApplyCouponDto,
} from './dto/cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.ACTIVE },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        items: [],
        subtotal: 0,
        total: 0,
      });
      await this.cartRepository.save(cart);
      this.logger.log(`Cart created for user: ${userId}`);
    }

    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.ACTIVE },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async addItem(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    let cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find(
      (item) => item.productId === addToCartDto.productId &&
                 item.variantId === addToCartDto.variantId
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
    } else {
      cart.items.push({
        productId: addToCartDto.productId,
        productSku: addToCartDto.productSku,
        productName: addToCartDto.productName,
        variantId: addToCartDto.variantId,
        quantity: addToCartDto.quantity,
        price: addToCartDto.price,
      });
    }

    cart = await this.updateCartTotals(cart);
    this.eventEmitter.emit('cart.item.added', {
      userId,
      cartId: cart.id,
      productId: addToCartDto.productId,
      quantity: addToCartDto.quantity,
    });

    return cart;
  }

  async updateItem(
    userId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
    variantId?: string,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    const item = cart.items.find(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (updateCartItemDto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    item.quantity = updateCartItemDto.quantity;
    const updatedCart = await this.updateCartTotals(cart);

    this.eventEmitter.emit('cart.item.updated', {
      userId,
      cartId: cart.id,
      productId,
      quantity: updateCartItemDto.quantity,
    });

    return updatedCart;
  }

  async removeItem(userId: string, productId: string, variantId?: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );

    if (cart.items.length === initialLength) {
      throw new NotFoundException('Item not found in cart');
    }

    const updatedCart = await this.updateCartTotals(cart);

    this.eventEmitter.emit('cart.item.removed', {
      userId,
      cartId: cart.id,
      productId,
    });

    return updatedCart;
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shippingCost = 0;
    cart.discount = 0;
    cart.total = 0;

    await this.cartRepository.save(cart);
    return cart;
  }

  async setShippingAddress(
    userId: string,
    setShippingAddressDto: SetShippingAddressDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.shippingAddress = setShippingAddressDto.address;
    cart.shippingMethod = setShippingAddressDto.shippingMethod;

    // Calculate shipping cost (simplified - integrate with real shipping provider)
    cart.shippingCost = 10; // TODO: Calculate based on address and method

    const updatedCart = await this.updateCartTotals(cart);
    return updatedCart;
  }

  async applyCoupon(userId: string, applyCouponDto: ApplyCouponDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    // TODO: Validate coupon code with coupon service
    // For now, just apply a fixed discount
    cart.couponCode = applyCouponDto.couponCode;
    cart.discount = cart.subtotal * 0.1; // 10% discount

    const updatedCart = await this.updateCartTotals(cart);
    return updatedCart;
  }

  private async updateCartTotals(cart: Cart): Promise<Cart> {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity - (item.discount || 0);
    }, 0);

    // Calculate tax (simplified - 10% tax)
    cart.tax = cart.subtotal * 0.1;

    // Calculate total
    cart.total = cart.subtotal + cart.tax + cart.shippingCost - cart.discount;

    await this.cartRepository.save(cart);
    return cart;
  }

  async abandonCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    cart.status = CartStatus.ABANDONED;
    cart.abandonedAt = new Date();
    await this.cartRepository.save(cart);

    this.eventEmitter.emit('cart.abandoned', {
      userId,
      cartId: cart.id,
      items: cart.items,
    });
  }
}
