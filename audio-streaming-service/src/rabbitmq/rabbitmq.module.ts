import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqService } from './rabbitmq.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'RABBITMQ_SERVICE',
                useFactory: () => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URL!],
                        queue: process.env.RABBITMQ_QUEUE!,
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
            },
            {
                name: 'RABBITMQ_DELAY_SERVICE',
                useFactory: () => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URL!],
                        queue: `${process.env.RABBITMQ_QUEUE!}_delay`,
                        queueOptions: {
                            durable: true,
                            arguments: {
                                'x-dead-letter-exchange': '',
                                'x-dead-letter-routing-key': process.env.RABBITMQ_QUEUE!,
                            },
                        },
                    },
                }),
            },
        ]),
    ],
    providers: [RmqService],
    exports: [RmqService],
})
export class RmqModule { }