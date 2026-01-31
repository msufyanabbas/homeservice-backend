// dto/provider-search.dto.ts
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { IsOptional, IsString } from 'class-validator';

export class ProviderSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  q: string;
}
