import { before } from "@vendetta/patcher";
import { ReactNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const CloudUploadModule = findByProps("CloudUpload");
const MessageSender = findByProps("sendMessage");
const ChannelStore = findByProps("getChannelId");

async function uploadToGoFile(file: any): Promise<string | null> {
  try {
    const serverRes = await fetch("https://api.gofile.io/getServer");
    const serverData = await serverRes.json();
    if (serverData.status !== "ok") return null;

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.filename || "upload.bin"
    } as any);

    if (storage.gofileToken) formData.append("token", storage.gofileToken);

    const uploadRes = await fetch(`https://${serverData.data.server}.gofile.io/uploadFile`, {
      method: "POST",
      body: formData
    });

    const result = await uploadRes.json();
    return result.status === "ok" ? result.data.downloadPage : null;
  } catch (err) {
    return null;
  }
}

export function patchUploader() {
  const CloudUpload = CloudUploadModule?.CloudUpload;
  if (!CloudUpload?.prototype) return () => {};

  const original = CloudUpload.prototype.reactNativeCompressAndExtractData;

  CloudUpload.prototype.reactNativeCompressAndExtractData = async function (...args: any[]) {
    const size = this.preCompressionSize ?? 0;
    const shouldUpload = !!storage.alwaysUpload || size > 10 * 1024 * 1024;

    if (!shouldUpload) return original.apply(this, args);

    this.preCompressionSize = 1337; 
    showToast("📤 Uploading to GoFile...");

    try {
      const link = await uploadToGoFile(this);
      if (typeof this.setStatus === "function") this.setStatus("CANCELED");

      if (link) {
        if (storage.copy) ReactNative.Clipboard.setString(link);
        
        const channelId = this.channelId ?? ChannelStore?.getChannelId?.();
        if (channelId && !storage.insert) {
          await MessageSender.sendMessage(channelId, { content: link });
        }
        showToast("✅ Done!");
      } else {
        showToast("❌ Upload failed");
      }
    } catch {
      showToast("❌ Error");
    }
    return null;
  };

  return () => { CloudUpload.prototype.reactNativeCompressAndExtractData = original; };
}

export function patchMessageSender() {
  if (!MessageSender) return;
  return before("sendMessage", MessageSender, (args) => args);
}

export function ensureDefaultSettings() {
  storage.alwaysUpload ??= false;
  storage.copy ??= true;
  storage.insert ??= false;
  storage.gofileToken ??= "";
        }
