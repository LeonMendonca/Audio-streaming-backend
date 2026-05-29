import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaServiceModule } from './prisma-service/prisma-service.module';
import { ArtistModule } from './artist/artist.module';
import { RmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaServiceModule, ArtistModule, RmqModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
