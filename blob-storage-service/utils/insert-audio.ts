import { Pool } from "pg";
import fsPromises from "node:fs/promises";

export const insertIntoDb = async (
    arr: Array<{ key: string, outputPath: string }>,
    db: Pool
) => {
    try {
        await db.query("START TRANSACTION");
        for (let i = 0; i < arr.length; i++) {
            console.time(`inserting into db ${arr[i]!.key}`)
            const audioData = await fsPromises.readFile(arr[i]!.outputPath);
            await db.query(`
                  INSERT INTO blobs (key, data)
                  VALUES ($1, $2)
                `, [arr[i]!.key, audioData]);
            console.timeEnd(`inserting into db ${arr[i]!.key}`)
            await fsPromises.unlink(arr[i]!.outputPath)
                .then(() => { console.log("Unlinked file", arr[i]!.key) })
                .catch(() => { console.error("Error unlinking file", arr[i]!.key) });
        }
        await db.query("COMMIT");
        console.log("Committed")
    } catch (err) {
        console.error("Error inserting into database", err);
        await db.query("ROLLBACK");
        throw err;
    }
};