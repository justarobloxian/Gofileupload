import { registerCommand } from "@vendetta/commands";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { setCloseDuration } from "../lib/state";
import { roundDuration } from "../lib/utils";

let unregister: (() => void) | null = null;

export function loadCommand() {
  if (unregister) return;

  const commandName = (storage.commandName || "gofile").replace(/^\//, "");

  unregister = registerCommand({
    name: commandName,
    description: "Force next upload to GoFile",
    options: [],
    execute() {
      setCloseDuration("forced");
      showToast("Next upload forced to GoFile.");
    },
  });
}

export function unloadCommand() {
  unregister?.();
  unregister = null;
}