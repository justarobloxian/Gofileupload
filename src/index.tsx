import { warmUpUploader } from "./lib/warmup";
import settings from "./pages/settings";
import { loadCommand, unloadCommand } from "./pages/command";
import { ensureDefaultSettings, patchUploader, patchMessageSender } from "./handler";

let unpatches: any[] = [];

export default {
  onLoad() {
    try {
      ensureDefaultSettings();
      loadCommand();
      const uploaderPatch = patchUploader();
      if (uploaderPatch) unpatches.push(uploaderPatch);
      const senderPatch = patchMessageSender();
      if (senderPatch) unpatches.push(senderPatch);
      warmUpUploader();
    } catch (e) {}
  },
  onUnload() {
    unloadCommand();
    for (const unpatch of unpatches) {
      if (typeof unpatch === "function") unpatch();
    }
  },
  settings,
};
