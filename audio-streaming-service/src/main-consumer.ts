import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: process.env.RABBITMQ_QUEUE as string,
      queueOptions: {
        durable: true,
      },
      noAck: false, // Ensures manual acknowledgment is required (set up in the consumer file)
      prefetchCount: 5, // Number of messages to process concurrently per instance
    },
  });

  await app.listen();
  console.log(`RabbitMQ Consumer Microservice is listening... (PID: ${process.pid})`);
}
bootstrap();
