import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { PromoCode } from '@database/entities/promo-code.entity';
import { PromoUsage } from '@database/entities/promo-usage.entity';

@ApiTags('Promo Codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create promo code (Admin only)' })
  @ApiResponse({ status: 201, description: 'Promo code created' })
  async create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all promo codes (Admin only)' })
  @ApiPaginatedResponse(PromoCode)
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.promoCodesService.findAll(paginationDto);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public promo codes' })
  @ApiResponse({ status: 200, description: 'Public promo codes retrieved' })
  async getPublicPromoCodes() {
    return this.promoCodesService.getPublicPromoCodes();
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate promo code' })
  @ApiResponse({ status: 200, description: 'Promo code validated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired promo code' })
  async validate(
    @CurrentUser() user: User,
    @Body() applyPromoCodeDto: ApplyPromoCodeDto,
  ) {
    return this.promoCodesService.validate(user.id, applyPromoCodeDto);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply promo code to booking' })
  @ApiResponse({ status: 200, description: 'Promo code applied' })
  async apply(
    @CurrentUser() user: User,
    @Body() applyPromoCodeDto: ApplyPromoCodeDto,
  ) {
    return this.promoCodesService.apply(user.id, applyPromoCodeDto);
  }

  @Get('me/usages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my promo code usages' })
  @ApiPaginatedResponse(PromoUsage)
  async getMyUsages(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.promoCodesService.getMyUsages(user.id, paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get promo code by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Promo code retrieved' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update promo code (Admin only)' })
  @ApiResponse({ status: 200, description: 'Promo code updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ) {
    return this.promoCodesService.update(id, updatePromoCodeDto);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate promo code (Admin only)' })
  @ApiResponse({ status: 200, description: 'Promo code deactivated' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodesService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete promo code (Admin only)' })
  @ApiResponse({ status: 204, description: 'Promo code deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodesService.remove(id);
  }

  @Get(':id/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get promo code statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodesService.getStatistics(id);
  }
}