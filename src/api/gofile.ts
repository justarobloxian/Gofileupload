import { storage } from "@vendetta/plugin";

export async function uploadToGoFile(media: any): Promise<string | null> {
  try {
    const fileUri =
      media?.item?.originalUri ||
      media?.uri ||
      media?.fileUri ||
      media?.path ||
      media?.sourceURL;

    if (!fileUri) throw new Error("Missing file URI");

    const filename = media.filename ?? "upload";
    const token = storage.gofileToken?.trim();

    const serverResponse = await fetch("https://api.gofile.io/getServer");
    const serverData = await serverResponse.json();
    if (serverData.status !== "ok") throw new Error("Failed to get GoFile server");
    
    const bestServer = serverData.data.server;

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: media.mimeType ?? "application/octet-stream",
    } as any);

    if (token) formData.append("token", token);

    const response = await fetch(`https://${bestServer}.gofile.io/uploadFile`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "ok") {
      return result.data.downloadPage;
    } else {
      throw new Error(result.status);
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}