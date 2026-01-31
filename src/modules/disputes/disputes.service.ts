import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '@database/entities/dispute.entity';
import { DisputeMessage } from '@database/entities/dispute-message.entity';
import { DisputeEvidence } from '@database/entities/dispute-evidence.entity';
import { Booking } from '@database/entities/booking.entity';
import { User } from '@database/entities/user.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputeMessageDto } from './dto/dispute-message.dto';
import { PaginationDto, createPaginatedResponse } from '@common/interfaces/pagination.interface';
import { DisputeStatus, DisputeResolution, DisputePriority } from '@common/enums/dispute.enum';
import { UserRole } from '@common/enums/user.enum';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeMessage)
    private readonly disputeMessageRepository: Repository<DisputeMessage>,
    @InjectRepository(DisputeEvidence)
    private readonly disputeEvidenceRepository: Repository<DisputeEvidence>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(user: User, createDisputeDto: CreateDisputeDto) {
    const { bookingId, ...disputeData } = createDisputeDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'provider'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.provider) {
  throw new BadRequestException('Booking has no provider assigned');
}

    if (booking.customerId !== user.id && booking.provider.userId !== user.id) {
      throw new ForbiddenException('Unauthorized to create dispute for this booking');
    }

    const disputeNumber = `DSP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const dispute = this.disputeRepository.create({
      disputeNumber,
      bookingId,
      reportedById: user.id,
      ...disputeData,
      status: DisputeStatus.OPEN,
      priority: DisputePriority.MEDIUM,
    });

    const evidenceDeadline = new Date();
    evidenceDeadline.setDate(evidenceDeadline.getDate() + 3);
    dispute.evidenceDeadline = evidenceDeadline;

    await this.disputeRepository.save(dispute);

    return dispute;
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.disputeRepository.createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.booking', 'booking')
      .leftJoinAndSelect('dispute.reportedBy', 'reportedBy');

    if (user.role !== UserRole.ADMIN) {
      query.where('dispute.reportedById = :userId', { userId: user.id });
    }

    const [disputes, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('dispute.createdAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(disputes, total, page, limit);
  }

  async findOne(user: User, id: string) {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['booking', 'reportedBy'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (user.role !== UserRole.ADMIN && dispute.reportedById !== user.id) {
      throw new ForbiddenException('Unauthorized to view this dispute');
    }

    return dispute;
  }

  async update(user: User, id: string, updateDisputeDto: UpdateDisputeDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (user.role !== UserRole.ADMIN && dispute.reportedById !== user.id) {
      throw new ForbiddenException('Unauthorized to update this dispute');
    }

    Object.assign(dispute, updateDisputeDto);
    await this.disputeRepository.save(dispute);

    return dispute;
  }

  async addEvidence(user: User, id: string, addEvidenceDto: AddEvidenceDto, files: Express.Multer.File[]) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const fileUrls = files ? files.map(f => `/uploads/${f.filename}`) : [];

    for (const fileUrl of fileUrls) {
      const evidence = this.disputeEvidenceRepository.create({
        disputeId: id,
        uploadedByUserId: user.id,
        uploadedByType: user.role === UserRole.CUSTOMER ? 'CUSTOMER' : 'PROVIDER',
        type: addEvidenceDto.type,
        fileUrl,
        fileName: files[fileUrls.indexOf(fileUrl)]?.originalname,
        fileSize: files[fileUrls.indexOf(fileUrl)]?.size,
        mimeType: files[fileUrls.indexOf(fileUrl)]?.mimetype,
        description: addEvidenceDto.description,
      });

      await this.disputeEvidenceRepository.save(evidence);
    }

    return { message: 'Evidence added successfully' };
  }

  async getEvidence(user: User, id: string) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const evidence = await this.disputeEvidenceRepository.find({
      where: { disputeId: id },
      order: { createdAt: 'DESC' },
    });

    return evidence;
  }

  async sendMessage(user: User, id: string, disputeMessageDto: DisputeMessageDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const message = this.disputeMessageRepository.create({
      disputeId: id,
      senderId: user.id,
      senderType: user.role === UserRole.ADMIN ? 'ADMIN' : user.role === UserRole.CUSTOMER ? 'CUSTOMER' : 'PROVIDER',
      message: disputeMessageDto.message,
    });

    await this.disputeMessageRepository.save(message);

    return message;
  }

  async getMessages(user: User, id: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const [messages, total] = await this.disputeMessageRepository.findAndCount({
      where: { disputeId: id },
      relations: ['sender'],
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
    });

    return createPaginatedResponse(messages, total, page, limit);
  }

  async escalate(user: User, id: string) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.status = DisputeStatus.ESCALATED;
    dispute.priority = DisputePriority.HIGH;
    await this.disputeRepository.save(dispute);

    return { message: 'Dispute escalated' };
  }

  async withdraw(user: User, id: string) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.reportedById !== user.id) {
      throw new ForbiddenException('Unauthorized');
    }

    dispute.status = DisputeStatus.CLOSED;
    dispute.resolution = DisputeResolution.WITHDRAWN;
    dispute.closedAt = new Date();
    await this.disputeRepository.save(dispute);

    return { message: 'Dispute withdrawn' };
  }

  async getAllDisputes(status?: string, paginationDto?: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const query = this.disputeRepository.createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.booking', 'booking')
      .leftJoinAndSelect('dispute.reportedBy', 'reportedBy');

    if (status) {
      query.where('dispute.status = :status', { status });
    }

    const [disputes, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('dispute.createdAt', 'DESC')
      .getManyAndCount();

    return createPaginatedResponse(disputes, total, page, limit);
  }

  async resolve(adminId: string, id: string, resolveDisputeDto: ResolveDisputeDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolution = resolveDisputeDto.resolution;
    dispute.resolutionNotes = resolveDisputeDto.notes;
    dispute.resolvedBy = adminId;
    dispute.resolvedAt = new Date();

    if (resolveDisputeDto.refundAmount) {
      dispute.refundAmount = resolveDisputeDto.refundAmount;
    }

    await this.disputeRepository.save(dispute);

    return { message: 'Dispute resolved' };
  }

  async assign(id: string, adminId: string) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.assignedTo = adminId;
    await this.disputeRepository.save(dispute);

    return { message: 'Dispute assigned' };
  }

  async getStatistics() {
    const total = await this.disputeRepository.count();
    const open = await this.disputeRepository.count({ where: { status: DisputeStatus.OPEN } });
    const resolved = await this.disputeRepository.count({ where: { status: DisputeStatus.RESOLVED } });

    return {
      total,
      open,
      resolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
    };
  }
}