const { storage } = vendetta.plugin;
const { Forms } = vendetta.metro.common;
const { FormRow, FormSwitch, FormSection } = Forms;

export default () => {
  // We ensure these exist so the toggles aren't "undefined"
  storage.alwaysUpload ??= false;
  storage.copyToClipboard ??= true;
  storage.insertIntoMessage ??= false;

  return (
    <FormSection title="Gofile Upload Settings">
      <FormSwitch
        label="Always upload to Gofile"
        subLabel="Ignore the 10MB limit and upload everything to Gofile"
        value={storage.alwaysUpload}
        onValueChange={(v: boolean) => (storage.alwaysUpload = v)}
      />
      <FormSwitch
        label="Copy link to clipboard"
        value={storage.copyToClipboard}
        onValueChange={(v: boolean) => (storage.copyToClipboard = v)}
      />
      <FormSwitch
        label="Insert into message"
        subLabel="Automatically put the link at the end of your message"
        value={storage.insertIntoMessage}
        onValueChange={(v: boolean) => (storage.insertIntoMessage = v)}
      />
    </FormSection>
  );
};
