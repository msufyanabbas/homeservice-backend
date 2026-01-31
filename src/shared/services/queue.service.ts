import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

export interface JobOptions {
  priority?: number;
  delay?: number; // in milliseconds
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

/**
 * Queue service using BullMQ for background jobs
 * Requires Redis for queue storage
 */
@Injectable()
export class QueueService implements OnModuleInit {
  private connection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private configService: ConfigService) {
    this.connection = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      maxRetriesPerRequest: null,
    });
  }

  onModuleInit() {
    // Initialize default queues
    this.createQueue('emails');
    this.createQueue('notifications');
    this.createQueue('payments');
    this.createQueue('reports');
  }

  /**
   * Create a queue
   */
  createQueue(name: string): Queue {
    if (this.queues.has(name)) {
      const queue = this.queues.get(name);
if (!queue) {
  return this.createQueue(name);
}
return queue;
    }

    const queue = new Queue(name, {
      connection: {
    host: this.configService.get('REDIS_HOST'),
    port: this.configService.get('REDIS_PORT'),
  },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Add job to queue
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: any,
    options?: JobOptions,
  ): Promise<void> {
    const queue = this.queues.get(queueName) || this.createQueue(queueName);
    
    await queue.add(jobName, data, options);
  }

  /**
   * Add delayed job
   */
  async addDelayedJob(
    queueName: string,
    jobName: string,
    data: any,
    delayMs: number,
  ): Promise<void> {
    await this.addJob(queueName, jobName, data, { delay: delayMs });
  }

  /**
   * Add scheduled job (cron-like)
   */
  async addScheduledJob(
    queueName: string,
    jobName: string,
    data: any,
    cronExpression: string,
  ): Promise<void> {
    const queue = this.queues.get(queueName) || this.createQueue(queueName);
    
    await queue.add(jobName, data, {
      repeat: {
        pattern: cronExpression,
      },
    });
  }

  /**
   * Register worker for queue
   */
  registerWorker(
    queueName: string,
    processor: (job: any) => Promise<any>,
  ): Worker {
    const worker = new Worker(queueName, processor, {
      connection: {
    host: this.configService.get('REDIS_HOST'),
    port: this.configService.get('REDIS_PORT'),
  },
      concurrency: 5,
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  /**
   * Get queue
   */
  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  /**
   * Get queue stats
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Clean queue (remove old jobs)
   */
  async cleanQueue(
    queueName: string,
    grace: number = 3600000, // 1 hour
    status: 'completed' | 'failed' = 'completed',
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.clean(grace, 100, status);
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
    }
  }
}