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
import { LocationsService } from './locations.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { SearchNearbyDto } from './dto/search-nearby.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Address management
  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async createAddress(
    @CurrentUser() user: User,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.locationsService.createAddress(user.id, createAddressDto);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved' })
  async getAddresses(@CurrentUser() user: User) {
    return this.locationsService.getAddresses(user.id);
  }

  @Get('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved' })
  async getAddress(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationsService.getAddress(user.id, id);
  }

  @Patch('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  async updateAddress(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.locationsService.updateAddress(user.id, id, updateAddressDto);
  }

  @Patch('addresses/:id/set-default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({ status: 200, description: 'Default address set' })
  async setDefaultAddress(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationsService.setDefaultAddress(user.id, id);
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 204, description: 'Address deleted' })
  async deleteAddress(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationsService.deleteAddress(user.id, id);
  }

  // Search nearby
  @Get('nearby/providers')
  @Public()
  @ApiOperation({ summary: 'Search nearby providers' })
  @ApiResponse({ status: 200, description: 'Nearby providers retrieved' })
  async searchNearbyProviders(@Query() searchNearbyDto: SearchNearbyDto) {
    return this.locationsService.searchNearbyProviders(searchNearbyDto);
  }

  @Get('nearby/services')
  @Public()
  @ApiOperation({ summary: 'Search nearby services' })
  @ApiResponse({ status: 200, description: 'Nearby services retrieved' })
  async searchNearbyServices(@Query() searchNearbyDto: SearchNearbyDto) {
    return this.locationsService.searchNearbyServices(searchNearbyDto);
  }

  // Provider location tracking
  @Post('provider/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update provider location (Provider only)' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateProviderLocation(
    @CurrentUser() user: User,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.updateProviderLocation(user.id, updateLocationDto);
  }

  @Get('provider/location/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get provider location history (Provider only)' })
  @ApiResponse({ status: 200, description: 'Location history retrieved' })
  async getProviderLocationHistory(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.locationsService.getProviderLocationHistory(user.id, startDate, endDate);
  }

  // Geocoding
  @Get('geocode')
  @Public()
  @ApiOperation({ summary: 'Geocode address to coordinates' })
  @ApiResponse({ status: 200, description: 'Coordinates retrieved' })
  async geocode(@Query('address') address: string) {
    return this.locationsService.geocode(address);
  }

  @Get('reverse-geocode')
  @Public()
  @ApiOperation({ summary: 'Reverse geocode coordinates to address' })
  @ApiResponse({ status: 200, description: 'Address retrieved' })
  async reverseGeocode(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return this.locationsService.reverseGeocode(latitude, longitude);
  }

  // Coverage areas
  @Get('coverage-areas')
  @Public()
  @ApiOperation({ summary: 'Get service coverage areas' })
  @ApiResponse({ status: 200, description: 'Coverage areas retrieved' })
  async getCoverageAreas() {
    return this.locationsService.getCoverageAreas();
  }
}