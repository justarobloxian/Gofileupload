import { storage } from "@vendetta/plugin";
import settings from "./pages/settings";
import { ensureDefaultSettings, patchUploader, patchMessageSender } from "./handler";

let unpatches: any[] = [];

export default {
  onLoad() {
    ensureDefaultSettings();
    const u1 = patchUploader();
    const u2 = patchMessageSender();
    if (u1) unpatches.push(u1);
    if (u2) unpatches.push(u2);
  },
  onUnload() {
    for (const unpatch of unpatches) unpatch?.();
  },
  settings
};
