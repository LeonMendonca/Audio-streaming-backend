import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from 'src/rabbitmq/rabbitmq.service';
import { uploadToBlobStorage } from 'src/blob/blob.utils';
import { ArtistService } from './artist.service';
import { getExponentialBackoff } from 'src/utils/backoff.util';

@Controller()
export class ArtistConsumer {
    constructor(
        private readonly rmqService: RmqService,
        private readonly artistService: ArtistService
    ) { }

    @EventPattern('audio_upload')
    async handleAudioUpload(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            console.log(`Processing audio upload for song ID: ${data.songId}`);
            await uploadToBlobStorage(data);
            await this.artistService.updateSongStatus(data.songId, 'UPLOADED');
            console.log(`Successfully uploaded song ID: ${data.songId}`);
            channel.ack(originalMsg);
        } catch (error) {
            console.error('Error uploading to blob storage service:', error);
            data.retries = data.retries || 0;
            const backoffMs = getExponentialBackoff(data.retries);
            await this.rmqService.sendRetryMessage(data, backoffMs);
            // Optionally nack the message to requeue or drop it
            channel.nack(originalMsg, false, false);
        }

        return "DONE";
    }

    @EventPattern('audio_upload_failed')
    async handleFailedAudioUpload(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            console.time("handle Failed")
            console.log(`Processing failed audio upload for song ID: ${data.songId} Retries: ${data.retries}`);
            await this.artistService.updateSongStatus(data.songId, 'FAILED');
            channel.nack(originalMsg, false, false);
            console.timeEnd("handle Failed")
        } catch (error) {
            console.error('Error handling failed audio upload:', error);
            // Optionally nack the message to requeue or drop it
            channel.nack(originalMsg, false, true);
        }

        return "DONE";
    }

    @EventPattern('audio_upload_retry')
    async handleRetryAudioUpload(@Payload() data: any, @Ctx() context: RmqContext) {
        const MAX_RETRIES = 3;
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            console.time("handle Retry")
            console.log(`Processing retry audio upload for song ID: ${data.songId} Retries: ${data.retries}`);
            if (data.retries >= MAX_RETRIES) {
                this.rmqService.sendFailedMessage(data);
                channel.nack(originalMsg, false, false);
                console.timeEnd("handle Retry")
                return;
            }
            // Update song status to "processing" at first retry, 
            // since other retries will also be the same
            if (data.retries === 0) {
                await this.artistService.updateSongStatus(data.songId, 'PROCESSING');
            }
            data.retries++;
            await this.rmqService.sendMessage(data);
            channel.ack(originalMsg);
            console.timeEnd("handle Retry")
        } catch (error) {
            console.error('Error handling retry audio upload:', error);
            // Optionally nack the message to requeue or drop it
            channel.nack(originalMsg, false, false);
        }

        return "DONE";
    }
}