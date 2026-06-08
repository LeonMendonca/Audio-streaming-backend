import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class ArtistConsumer {
    @EventPattern('audio_upload')
    async handleAudioUpload(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            console.log(`Processing audio upload for song ID: ${data.songId}`);

            const fileBuffer = Buffer.isBuffer(data.file.buffer) 
                ? data.file.buffer 
                : Buffer.from(data.file.buffer.data);

            const formData = new FormData();
            
            const audioMetadata = JSON.stringify([{
                fileName: data.file.originalname,
                trackId: data.songId
            }]);

            formData.append('audio_metadata', audioMetadata);

            const blob = new Blob([fileBuffer], { type: data.file.mimetype });
            formData.append('audio', blob, data.file.originalname);

            const response = await fetch(process.env.BLOB_SERVICE_URL || 'http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            console.log(`Successfully uploaded song ID: ${data.songId}`);
            channel.ack(originalMsg);
        } catch (error) {
            console.error('Error uploading to blob storage service:', error);
            // Optionally nack the message to requeue or drop it
            // channel.nack(originalMsg, false, false); 
        }

        return "DONE";
    }
}