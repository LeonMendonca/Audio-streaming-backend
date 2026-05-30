import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class AudioDurationBitratePipe implements PipeTransform {
    async transform(value: Express.Multer.File[], metadata: ArgumentMetadata) {
        if (!value || value.length === 0) return value;

        for (const file of value) {
            const tempFilePath = path.join(os.tmpdir(), `${randomUUID()}-${file.originalname}`);

            try {
                // Save the file to an OS temp path
                await fs.writeFile(tempFilePath, file.buffer);

                // Process it with fluent-ffmpeg
                const audioInfo = await new Promise<{ duration: number, bit_rate: number }>((resolve, reject) => {
                    ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                        if (err) {
                            reject(new Error(`ffprobe error: ${err.message}`));
                            return;
                        }

                        const duration = metadata.format.duration;
                        const bit_rate = metadata.format.bit_rate;
                        if (duration !== undefined && bit_rate !== undefined) {
                            resolve({ duration, bit_rate });
                        } else {
                            reject(new Error('Could not determine audio duration or bitrate.'));
                        }
                    });
                });

                console.log(`Audio duration: ${audioInfo.duration}s, Bitrate: ${Math.round(audioInfo.bit_rate / 1000)}kbps`);

                if (audioInfo.duration > 600) { // 10 minutes = 600 seconds
                    throw new BadRequestException(`Audio file ${file.originalname} exceeds the 10-minute limit.`);
                }

                const MIN_BITRATE = 128000; // 128 kbps standard
                if (audioInfo.bit_rate < MIN_BITRATE) {
                    throw new BadRequestException(`Audio file ${file.originalname} has a bitrate of ${Math.round(audioInfo.bit_rate / 1000)}kbps, which is below the minimum standard of ${Math.round(MIN_BITRATE / 1000)}kbps.`);
                }
            } catch (err) {
                if (err instanceof BadRequestException) {
                    throw err;
                }
                throw new BadRequestException(`Failed to process audio file: ${err.message}`);
            } finally {
                // Unlink / delete the file once it's done
                try {
                    await fs.unlink(tempFilePath);
                } catch (unlinkErr) {
                    console.error(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
                }
            }
        }

        return value;
    }
}
