import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UploadSongMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('UploadSongMiddleware: processing uploadSong request');
    // You can add any validation or preprocessing here.
    next();
  }
}
