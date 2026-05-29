import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RmqService {
    constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) { }

    async sendMessage(data: any) {
        return this.client.emit('audio_upload', data);
    }
}