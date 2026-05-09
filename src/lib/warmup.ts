import { uploadToGoFile } from "../api/gofile";
import { getRandomString } from "./utils";

export function createWarmupFile() {
  const randomName = `warmup_${getRandomString()}.bin`;
  const sizeInBytes = Math.floor(Math.random() * 1048576) + 1;

  return {
    uri: "data:application/octet-stream;base64,AA==",
    filename: randomName,
    mimeType: "application/octet-stream",
    preCompressionSize: sizeInBytes,
  };
}

export function warmUpUploader() {
  setTimeout(async () => {
    const file = createWarmupFile();

    try {
      const gofileLink = await uploadToGoFile(file);
      console.log(`[WarmUp] GoFile upload complete: ${gofileLink}`);
    } catch (err) {
      console.warn("[WarmUp] GoFile upload failed:", err);
    }
  }, 0);
}