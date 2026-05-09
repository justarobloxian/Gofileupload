import { storage } from "@vendetta/plugin";

export async function uploadToGoFile(media: any): Promise<string | null> {
  try {
    const fileUri = media?.item?.originalUri || media?.uri || media?.fileUri || media?.path || media?.sourceURL;
    if (!fileUri) return null;

    const filename = media.filename ?? "upload";
    const token = storage.gofileToken?.trim();

    const serverRes = await fetch("https://api.gofile.io/getServer");
    const serverData = await serverRes.json();
    if (serverData.status !== "ok") return null;
    
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: media.mimeType ?? "application/octet-stream",
    } as any);

    if (token) formData.append("token", token);

    const response = await fetch(`https://${serverData.data.server}.gofile.io/uploadFile`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return result.status === "ok" ? result.data.downloadPage : null;
  } catch {
    return null;
  }
}
