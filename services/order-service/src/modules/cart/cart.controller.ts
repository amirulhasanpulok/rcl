import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  SetShippingAddressDto,
  ApplyCouponDto,
  CartResponseDto,
} from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async getCart(@Req() req: any): Promise<CartResponseDto> {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, type: CartResponseDto })
  async addItem(
    @Req() req: any,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(req.user.sub, addToCartDto);
  }

  @Put('items/:productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async updateItem(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Query('variantId') variantId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(req.user.sub, productId, updateCartItemDto, variantId);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Req() req: any,
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
  ): Promise<void> {
    await this.cartService.removeItem(req.user.sub, productId, variantId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Req() req: any): Promise<void> {
    await this.cartService.clearCart(req.user.sub);
  }

  @Put('shipping')
  @ApiOperation({ summary: 'Set shipping address and method' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async setShippingAddress(
    @Req() req: any,
    @Body() setShippingAddressDto: SetShippingAddressDto,
  ): Promise<CartResponseDto> {
    return this.cartService.setShippingAddress(req.user.sub, setShippingAddressDto);
  }

  @Post('coupon')
  @ApiOperation({ summary: 'Apply coupon code' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async applyCoupon(
    @Req() req: any,
    @Body() applyCouponDto: ApplyCouponDto,
  ): Promise<CartResponseDto> {
    return this.cartService.applyCoupon(req.user.sub, applyCouponDto);
  }

  @Post('abandon')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark cart as abandoned' })
  async abandonCart(@Req() req: any): Promise<void> {
    await this.cartService.abandonCart(req.user.sub);
  }
}
