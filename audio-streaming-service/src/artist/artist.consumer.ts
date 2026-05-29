import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class ArtistConsumer {
    @EventPattern('audio_upload')
    async handleAudioUploadC1(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        // TODO: Add logic to process the audio file

        channel.ack(originalMsg);

        return "DONE";
    }
}