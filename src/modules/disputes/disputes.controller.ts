import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputeMessageDto } from './dto/dispute-message.dto';
import { PaginationDto } from '@common/interfaces/pagination.interface';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user.enum';
import { User } from '@database/entities/user.entity';
import { FileUploadService } from '@/shared/services/file-upload.service';
import { Dispute } from '@database/entities/dispute.entity';
import { DisputeMessage } from '@database/entities/dispute-message.entity';

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService, private fileUploadService: FileUploadService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.fileUploadService.uploadImage(
      file,
      'avatars',
      { width: 300, height: 300, quality: 80 }
    );
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create dispute' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  async create(
    @CurrentUser() user: User,
    @Body() createDisputeDto: CreateDisputeDto,
  ) {
    return this.disputesService.create(user, createDisputeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user disputes' })
  @ApiPaginatedResponse(Dispute)
  async findAll(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.disputesService.findAll(user, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  @ApiResponse({ status: 200, description: 'Dispute retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disputesService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dispute' })
  @ApiResponse({ status: 200, description: 'Dispute updated successfully' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisputeDto: UpdateDisputeDto,
  ) {
    return this.disputesService.update(user, id, updateDisputeDto);
  }

  @Post(':id/evidence')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add evidence to dispute' })
  @ApiResponse({ status: 201, description: 'Evidence added successfully' })
  async addEvidence(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addEvidenceDto: AddEvidenceDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.disputesService.addEvidence(user, id, addEvidenceDto, files || []);
  }

  @Get(':id/evidence')
  @ApiOperation({ summary: 'Get dispute evidence' })
  @ApiResponse({ status: 200, description: 'Evidence retrieved' })
  async getEvidence(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disputesService.getEvidence(user, id);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message in dispute' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() disputeMessageDto: DisputeMessageDto,
  ) {
    return this.disputesService.sendMessage(user, id, disputeMessageDto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get dispute messages' })
  @ApiPaginatedResponse(DisputeMessage)
  async getMessages(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.disputesService.getMessages(user, id, paginationDto);
  }

  @Post(':id/escalate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Escalate dispute' })
  @ApiResponse({ status: 200, description: 'Dispute escalated' })
  async escalate(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disputesService.escalate(user, id);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw dispute' })
  @ApiResponse({ status: 200, description: 'Dispute withdrawn' })
  async withdraw(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disputesService.withdraw(user, id);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all disputes (Admin only)' })
  @ApiPaginatedResponse(Dispute)
  async getAllDisputes(
    @Query('status') status?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.disputesService.getAllDisputes(status, paginationDto);
  }

  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve dispute (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dispute resolved' })
  async resolve(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resolveDisputeDto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(admin.id, id, resolveDisputeDto);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign dispute to admin (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dispute assigned' })
  async assign(
    @CurrentUser() admin: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminId') adminId: string,
  ) {
    return this.disputesService.assign(id, adminId);
  }

  @Get('admin/statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dispute statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics() {
    return this.disputesService.getStatistics();
  }
}