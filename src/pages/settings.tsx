const { storage } = vendetta.plugin;
const { Forms } = vendetta.metro.common;
const { FormSection, FormSwitch } = Forms;

export default () => {
  storage.alwaysUpload ??= false;
  storage.copyToClipboard ??= true;
  storage.insertIntoMessage ??= false;

  return (
    <FormSection title="Gofile Settings">
      <FormSwitch
        label="Always upload to hoster"
        value={storage.alwaysUpload}
        onValueChange={(v) => storage.alwaysUpload = v}
      />
      <FormSwitch
        label="Copy link to clipboard"
        value={storage.copyToClipboard}
        onValueChange={(v) => storage.copyToClipboard = v}
      />
      <FormSwitch
        label="Insert into message"
        value={storage.insertIntoMessage}
        onValueChange={(v) => storage.insertIntoMessage = v}
      />
    </FormSection>
  );
}
