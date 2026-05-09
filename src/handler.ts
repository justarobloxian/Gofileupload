import { before } from "@vendetta/patcher";
import { ReactNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { uploadToGoFile } from "./api/gofile";

const CloudUploadModule = findByProps("CloudUpload");
const MessageSender = findByProps("sendMessage");

export function patchUploader() {
  const CloudUpload = CloudUploadModule?.CloudUpload;
  if (!CloudUpload?.prototype) return () => {};

  const original = CloudUpload.prototype.reactNativeCompressAndExtractData;
  CloudUpload.prototype.reactNativeCompressAndExtractData = async function (...args: any[]) {
    const size = this.preCompressionSize ?? 0;
    if (!storage.alwaysUpload && size < 10485760) return original.apply(this, args);

    showToast("📤 Uploading to GoFile...");
    this.preCompressionSize = 1337; // Spoof size to bypass native limits

    try {
      const link = await uploadToGoFile(this);
      if (typeof this.setStatus === "function") this.setStatus("CANCELED");

      if (link) {
        if (storage.copy) ReactNative.Clipboard.setString(link);
        showToast("Link ready!");
        if (MessageSender && this.channelId) {
            await MessageSender.sendMessage(this.channelId, { content: link });
        }
      }
    } catch {
      showToast("Upload failed");
    }
    return null;
  };
  return () => { CloudUpload.prototype.reactNativeCompressAndExtractData = original; };
}
