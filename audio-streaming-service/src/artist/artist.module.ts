import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { ArtistConsumer } from './artist.consumer';
import { RmqModule } from 'src/rabbitmq/rabbitmq.module';
import { UploadSongMiddleware } from './middleware/upload-song.middleware';

@Module({
  imports: [RmqModule],
  controllers: [ArtistController, ArtistConsumer],
  providers: [ArtistService],
})
export class ArtistModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadSongMiddleware)
      .forRoutes({ path: 'artist/upload', method: RequestMethod.POST });
  }
}
