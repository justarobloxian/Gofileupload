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
  if (!CloudUpload?.prototype) return;

  const original = CloudUpload.prototype.reactNativeCompressAndExtractData;
  CloudUpload.prototype.reactNativeCompressAndExtractData = async function (...args: any[]) {
    if (!storage.alwaysUpload && (this.preCompressionSize ?? 0) < 10485760) {
      return original.apply(this, args);
    }

    showToast("Uploading to GoFile...");
    const link = await uploadToGoFile(this);

    if (link) {
      if (storage.copy) ReactNative.Clipboard.setString(link);
      showToast("Upload successful!");
    }
    return null; 
  };
  return () => { CloudUpload.prototype.reactNativeCompressAndExtractData = original; };
}

export function patchMessageSender() {
  if (!MessageSender) return;
  return before("sendMessage", MessageSender, (args) => {
    return args;
  });
}
