export async function uploadToBlobStorage(data: any): Promise<void> {
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

    const URL = `${process.env.BLOB_SERVICE_URL}/upload`;

    const response = await fetch(URL, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
    }
}
