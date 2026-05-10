import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/metro/common";

const { FormSection, FormSwitch } = Forms;

export default () => {
  storage.alwaysUpload ??= false;
  storage.copy ??= true;
  storage.insert ??= false;

  return (
    <FormSection title="Gofile Settings">
      <FormSwitch 
        label="Always upload to Gofile" 
        value={storage.alwaysUpload} 
        onValueChange={(v: boolean) => storage.alwaysUpload = v} 
      />
      <FormSwitch 
        label="Copy link to clipboard" 
        value={storage.copy} 
        onValueChange={(v: boolean) => storage.copy = v} 
      />
      <FormSwitch 
        label="Insert into message" 
        value={storage.insert} 
        onValueChange={(v: boolean) => storage.insert = v} 
      />
    </FormSection>
  );
}
