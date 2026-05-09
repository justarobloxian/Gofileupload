import { before } from "@vendetta/patcher";
import { ReactNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const CloudUpload = findByProps("CloudUpload")?.CloudUpload;
const MessageSender = findByProps("sendMessage");
const ChannelStore = findByProps("getChannelId");
const PendingMessages = findByProps("getPendingMessages", "deletePendingMessage");

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

    const uploadRes = await fetch(`https://${serverData.data.server}.gofile.io/uploadFile`, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" }
    });

    const uploadData = await uploadRes.json();
    return uploadData.status === "ok" ? uploadData.data.downloadPage : null;
  } catch {
    return null;
  }
}

export function ensureDefaultSettings() {
  if (typeof storage.alwaysUpload !== "boolean") storage.alwaysUpload = false;
  if (typeof storage.copy !== "boolean") storage.copy = true;
  if (typeof storage.insert !== "boolean") storage.insert = false;
  if (storage.selectedHost !== "gofile") storage.selectedHost = "gofile";
}

function cleanup(channelId: string) {
  try {
    const pending = PendingMessages?.getPendingMessages?.(channelId);
    if (!pending) return;
    for (const [id, msg] of Object.entries(pending)) {
      if (msg.state === "FAILED") PendingMessages.deletePendingMessage(channelId, id);
    }
  } catch {}
}

let storeLink: string | null = null;

export function patchMessageSender(): () => void {
  return before("sendMessage", MessageSender, (args) => {
    const message = args[1];
    if (storage.insert && storeLink && message?.content) {
      message.content = `${message.content}\n${storeLink}`;
      storeLink = null;
    }
    return args;
  });
}

export function patchUploader(): () => void {
  const originalUpload = CloudUpload.prototype.reactNativeCompressAndExtractData;

  CloudUpload.prototype.reactNativeCompressAndExtractData = async function (...args: any[]) {
    const file = this;
    const size = file?.preCompressionSize ?? 0;
    
    const shouldUpload = !!storage.alwaysUpload || size > 10 * 1024 * 1024;
    if (!shouldUpload) return originalUpload.apply(this, args);

    this.preCompressionSize = 1337; 
    showToast(`📤 Uploading to GoFile...`);

    const channelId = this?.channelId ?? ChannelStore?.getChannelId?.();

    try {
      const link = await uploadToGoFile(file);

      if (typeof this.setStatus === "function") this.setStatus("CANCELED");
      if (channelId) setTimeout(() => cleanup(channelId), 500);

      if (link) {
        const content = `[${file?.filename ?? "file"}](${link})`;
        if (storage.insert) {
          storeLink = content;
          showToast("Link queued.");
        }
        if (storage.copy) {
          ReactNative.Clipboard.setString(content);
          showToast("Copied to clipboard!");
        } 
        if (!storage.insert && channelId) {
          await MessageSender.sendMessage(channelId, { content });
        }
      } else {
        showToast("Upload failed.");
      }
    } catch {
      showToast("Upload error.");
      if (channelId) setTimeout(() => cleanup(channelId), 500);
    }
    return null;
  };

  return () => { CloudUpload.prototype.reactNativeCompressAndExtractData = originalUpload; };
}