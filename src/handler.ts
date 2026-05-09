import { before } from "@vendetta/patcher";
import { ReactNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { uploadToGoFile } from "./api/gofile"; 

const CloudUploadModule = findByProps("CloudUpload");
const MessageSender = findByProps("sendMessage");

export function ensureDefaultSettings() {
  storage.alwaysUpload ??= false;
  storage.copy ??= true;
  storage.insert ??= false;
}

export function patchUploader() {
  const CloudUpload = CloudUploadModule?.CloudUpload;
  if (!CloudUpload?.prototype) return () => {};

  const originalUpload = CloudUpload.prototype.reactNativeCompressAndExtractData;

  CloudUpload.prototype.reactNativeCompressAndExtractData = async function (...args: any[]) {
    const file = this;
    const size = file?.preCompressionSize ?? 0;
    const shouldUpload = !!storage.alwaysUpload || size > 10 * 1024 * 1024;
    
    if (!shouldUpload) return originalUpload.apply(this, args);

    this.preCompressionSize = 1337; 
    showToast("📤 Uploading to GoFile...");

    try {
      const link = await uploadToGoFile(file);
      if (typeof this.setStatus === "function") this.setStatus("CANCELED");

      if (link) {
        if (storage.copy) ReactNative.Clipboard.setString(link);
        showToast("✅ Uploaded!");
      } else {
        showToast("❌ Upload failed.");
      }
    } catch {
      showToast("❌ Error.");
    }
    return null;
  };

  return () => { CloudUpload.prototype.reactNativeCompressAndExtractData = originalUpload; };
}

export function patchMessageSender() {
    if (!MessageSender) return;
    return before("sendMessage", MessageSender, (args) => {
      return args;
    });
}
