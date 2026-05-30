import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class ArtistConsumer {
    @EventPattern('audio_upload')
    async handleAudioUpload(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        // TODO: Add logic to process the audio file
        console.log(data);

        channel.ack(originalMsg);

        return "DONE";
    }
}