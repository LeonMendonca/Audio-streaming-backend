import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma-service/prisma-service.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('health/db')
  async getDbHealth() {
    try {
      const dbCheckPromise = this.prisma.$queryRaw<any[]>`
        SELECT 
          current_database() as database,
          version() as postgres_version,
          (SELECT sum(numbackends) FROM pg_stat_database) as active_connections
      `;
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );

      const result = await Promise.race([dbCheckPromise, timeoutPromise]) as any[];
      const dbStats = result[0];

      return {
        status: "connected",
        system: {
          database: dbStats.database,
          version: dbStats.postgres_version,
          active_connections: Number(dbStats.active_connections) || 0
        }
      };
    } catch (error: any) {
      throw new ServiceUnavailableException({
        status: "disconnected",
        error: error.message || "Unknown database error"
      });
    }
  }
}
