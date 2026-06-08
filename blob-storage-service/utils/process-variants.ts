
import ffmpeg from "fluent-ffmpeg";
import path from "node:path";
import { variants } from "../constants/audio.constants.variants";

export const processAudioVariants = (
    tempDir: string,
    variant: typeof variants[0],
    trackId: string,
    inputPath: string,
    idx: number
): Promise<{ key: string, outputPath: string }> => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(tempDir, `${trackId}_${variant.bitrate}.m4a`);
        console.time(`${trackId}-${variant.quality}`)
        ffmpeg(inputPath)
            .audioCodec('aac')
            .audioBitrate(variant.bitrate)
            .format('mp4')
            .outputOptions('-movflags +faststart')
            .save(outputPath)
            .on('end', () => {
                resolve({ key: `${trackId}-${variant.quality}`, outputPath });
                console.timeEnd(`${trackId}-${variant.quality}`)
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};
