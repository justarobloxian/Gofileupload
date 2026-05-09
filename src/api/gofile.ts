import { storage } from "@vendetta/plugin";

export async function uploadToGoFile(file: any): Promise<string | null> {
  try {
    const serverRes = await fetch("https://api.gofile.io/getServer");
    const serverData = await serverRes.json();
    if (serverData.status !== "ok") return null;

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.filename || "upload"
    } as any);

    if (storage.token) formData.append("token", storage.token);

    const uploadRes = await fetch(`https://${serverData.data.server}.gofile.io/uploadFile`, {
      method: "POST",
      body: formData
    });

    const uploadData = await uploadRes.json();
    return uploadData.status === "ok" ? uploadData.data.downloadPage : null;
  } catch {
    return null;
  }
}
