import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma-service/prisma-service.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) { }

  async getHello(): Promise<number> {
    return await this.prismaService.$executeRaw`SELECT 1=1`;
  }
}
