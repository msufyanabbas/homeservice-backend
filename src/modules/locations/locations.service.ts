import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '@database/entities/address.entity';
import { ProviderLocation } from '@database/entities/provider-location.entity';
import { Provider } from '@database/entities/provider.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { SearchNearbyDto } from './dto/search-nearby.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
    @InjectRepository(ProviderLocation) private readonly providerLocationRepository: Repository<ProviderLocation>,
    @InjectRepository(Provider) private readonly providerRepository: Repository<Provider>,
  ) {}

  async createAddress(userId: string, createAddressDto: CreateAddressDto) {
    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
      location: `SRID=4326;POINT(${createAddressDto.longitude} ${createAddressDto.latitude})`,
    });

    await this.addressRepository.save(address);
    return address;
  }

  async getAddresses(userId: string) {
    return await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async getAddress(userId: string, id: string) {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async updateAddress(userId: string, id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.getAddress(userId, id);
    Object.assign(address, updateAddressDto);
    
    if (updateAddressDto.latitude && updateAddressDto.longitude) {
      address.location = `SRID=4326;POINT(${updateAddressDto.longitude} ${updateAddressDto.latitude})`;
    }

    await this.addressRepository.save(address);
    return address;
  }

  async setDefaultAddress(userId: string, id: string) {
    await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    const address = await this.getAddress(userId, id);
    address.isDefault = true;
    await this.addressRepository.save(address);
    return { message: 'Default address set' };
  }

  async deleteAddress(userId: string, id: string) {
    await this.addressRepository.delete({ id, userId });
    return { message: 'Address deleted' };
  }

  async searchNearbyProviders(searchNearbyDto: SearchNearbyDto) {
    const { latitude, longitude, radius = 20 } = searchNearbyDto;

    const locations = await this.providerLocationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.provider', 'provider')
      .where(
        `ST_DWithin(
          location.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        { latitude, longitude, radius: radius * 1000 },
      )
      .limit(50)
      .getMany();

    return locations;
  }

  async searchNearbyServices(searchNearbyDto: SearchNearbyDto) {
    // TODO: Implement service nearby search
    return [];
  }

  async updateProviderLocation(userId: string, updateLocationDto: UpdateLocationDto) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
  throw new NotFoundException('Provider not found');
}
    const location = this.providerLocationRepository.create({
      providerId: provider.id,
      latitude: updateLocationDto.latitude,
      longitude: updateLocationDto.longitude,
      location: `SRID=4326;POINT(${updateLocationDto.longitude} ${updateLocationDto.latitude})`,
      accuracy: updateLocationDto.accuracy,
      recordedAt: new Date(),
    });

    await this.providerLocationRepository.save(location);
    return { message: 'Location updated' };
  }

  async getProviderLocationHistory(userId: string, startDate?: string, endDate?: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider) {
  throw new NotFoundException('Provider not found');
}
    
    const query = this.providerLocationRepository.createQueryBuilder('location')
      .where('location.providerId = :providerId', { providerId: provider.id });

    if (startDate && endDate) {
      query.andWhere('location.recordedAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    return await query.orderBy('location.recordedAt', 'DESC').getMany();
  }

  async geocode(address: string) {
    // TODO: Implement geocoding (use Google Maps API or similar)
    return { latitude: 0, longitude: 0 };
  }

  async reverseGeocode(latitude: number, longitude: number) {
    // TODO: Implement reverse geocoding
    return { address: 'Address not found' };
  }

  async getCoverageAreas() {
    // TODO: Implement coverage areas
    return [];
  }
}