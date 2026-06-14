import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';

@Injectable()
export class RmqService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
        @Inject('RABBITMQ_DELAY_SERVICE') private delayClient: ClientProxy,
    ) { }

    async sendMessage(data: any) {
        return this.client.emit('audio_upload', data);
    }

    async sendFailedMessage(data: any) {
        return this.client.emit('audio_upload_failed', data);
    }

    async sendRetryMessage(data: any, delayMs: number = 5000) {
        // Using TTL and Dead Letter Exchange (DLX) to implement the delay
        const record = new RmqRecordBuilder(data)
            .setOptions({
                expiration: delayMs,
            })
            .build();

        return this.delayClient.emit('audio_upload_retry', record);
    }
}