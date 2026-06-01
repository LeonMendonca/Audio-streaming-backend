import { FileValidator, Injectable } from '@nestjs/common';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffprobe from 'ffprobe-static';

ffmpeg.setFfprobePath(ffprobe.path);

export type AudioPipeValidatorOptions = {
    maxDuration: number;
    minBitrate: number;
    maxFileSize: number;
    allowedExtensions: string[];
    allowedCodecs: string[];
};

@Injectable()
export class AudioPipe extends FileValidator<AudioPipeValidatorOptions> {
    private errorMessage: string = 'Validation failed';

    constructor(
        protected readonly validationOptions: AudioPipeValidatorOptions
    ) {
        super(validationOptions);
    }

    async isValid(file?: Express.Multer.File): Promise<boolean> {
        if (!file) return false;

        const maxFileSize = this.validationOptions.maxFileSize;
        if (file.size > maxFileSize) {
            this.errorMessage = `Audio file ${file.originalname} exceeds the maximum file size of ${maxFileSize / (1024 * 1024)}MB.`;
            return false;
        }

        const allowedExtensions = this.validationOptions.allowedExtensions;
        const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
        if (!allowedExtensions.includes(extension)) {
            this.errorMessage = `File extension .${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`;
            return false;
        }

        const tempFilePath = path.join(os.tmpdir(), `${randomUUID()}-${file.originalname}`);

        try {
            await fs.writeFile(tempFilePath, file.buffer);

            const audioInfo = await new Promise<{ duration: number, bit_rate: number, codec_name: string }>((resolve, reject) => {
                ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                    if (err) {
                        reject(new Error(`ffprobe error: ${err.message}`));
                        return;
                    }

                    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                    if (!audioStream) {
                        reject(new Error('No audio stream found format.'));
                        return;
                    }

                    const duration = metadata.format.duration || audioStream.duration;
                    const bit_rate = metadata.format.bit_rate || audioStream.bit_rate;
                    const codec_name = audioStream.codec_name;

                    if (duration !== undefined && bit_rate !== undefined && codec_name) {
                        resolve({ duration: Number(duration), bit_rate: Number(bit_rate), codec_name });
                    } else {
                        reject(new Error('Could not determine audio duration, bitrate, or codec.'));
                    }
                });
            });

            const allowedCodecs = this.validationOptions.allowedCodecs;
            if (!allowedCodecs.includes(audioInfo.codec_name)) {
                this.errorMessage = `Audio codec ${audioInfo.codec_name} is not supported. Allowed codecs: ${allowedCodecs.join(', ')}`;
                return false;
            }

            const maxDuration = this.validationOptions.maxDuration;
            if (audioInfo.duration > maxDuration) {
                this.errorMessage = `Audio file ${file.originalname} exceeds the limit of ${maxDuration} seconds.`;
                return false;
            }

            const minBitrate = this.validationOptions.minBitrate;
            if (audioInfo.bit_rate < minBitrate) {
                this.errorMessage = `Audio file ${file.originalname} has a bitrate of ${Math.round(audioInfo.bit_rate / 1000)}kbps, which is below the minimum standard of ${Math.round(minBitrate / 1000)}kbps.`;
                return false;
            }

            (file as any).duration = audioInfo.duration;
            return true;
        } catch (err: any) {
            this.errorMessage = `Failed to process audio file: ${err.message}`;
            return false;
        } finally {
            try {
                await fs.unlink(tempFilePath);
            } catch (unlinkErr) {
                console.error(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
            }
        }
    }

    buildErrorMessage(file: any): string {
        return this.errorMessage;
    }
}
