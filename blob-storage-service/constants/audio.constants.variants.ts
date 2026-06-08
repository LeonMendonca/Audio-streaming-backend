export const variants = [
    { quality: "saver", bitrate: "64k" },
    { quality: "standard", bitrate: "128k" },
    { quality: "enhanced", bitrate: "320k" }
];

export type AudioVariant = typeof variants;