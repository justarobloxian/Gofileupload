import { before } from "@vendetta/patcher";
import { ReactNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { uploadToGoFile } from "./api/gofile";

const CloudUploadModule = findByProps("CloudUpload");
const MessageSender = findByProps("sendMessage");
const ChannelStore = findByProps("getChannelId");
const PendingMessages = findByProps("getPendingMessages", "deletePendingMessage");

export function ensureDefaultSettings() {
  storage.alwaysUpload ??= false;
  storage.copy ??= true;
  storage.insert ??= false;
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

export function patchMessageSender() {
  if (!MessageSender) return;
  return before("sendMessage", MessageSender, (args) => {
    const message = args[1];
    if (storage.insert && storeLink && message?.content) {
      message.content = `${message.content}\n${storeLink}`;
      storeLink = null;
    }
    return args;
  });
}

export function patchUploader() {
  const CloudUpload = CloudUploadModule?.CloudUpload;
  if (!CloudUpload?.prototype) return;

  const originalUpload = CloudUpload.prototype.reactNativeCompressAndExtractData;

  CloudUpload.prototype.reactNativeCompressAndExtractData = async function (...args: any[]) {
    const file = this;
    const size = file?.preCompressionSize ?? 0;
    const shouldUpload = !!storage.alwaysUpload || size > 10 * 1024 * 1024;
    
    if (!shouldUpload) return originalUpload.apply(this, args);

    this.preCompressionSize = 1337; 
    showToast(`Uploading to GoFile...`);

    const channelId = this?.channelId ?? ChannelStore?.getChannelId?.();

    try {
      const link = await uploadToGoFile(file);
      if (typeof this.setStatus === "function") this.setStatus("CANCELED");
      if (channelId) setTimeout(() => cleanup(channelId), 500);

      if (link) {
        const content = `[${file?.filename ?? "file"}](${link})`;
        if (storage.insert) storeLink = content;
        if (storage.copy) ReactNative.Clipboard.setString(content);
        if (!storage.insert && channelId) await MessageSender.sendMessage(channelId, { content });
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
