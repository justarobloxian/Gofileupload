import { React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const { ScrollView } = findByProps("ScrollView");
const {
  TableRowGroup,
  TableSwitchRow,
  Stack,
} = findByProps("TableSwitchRow", "TableRowGroup", "Stack");

const { TextInput } = findByProps("TextInput");

const get = (k: string, fallback: any = "") => storage[k] ?? fallback;
const set = (k: string, v: any) => (storage[k] = v);

export default function Settings() {
  const [_, forceUpdate] = React.useReducer(x => ~x, 0);
  const update = () => forceUpdate();

  return (
    <ScrollView style={{ flex: 1 }}>
      <Stack spacing={8} style={{ padding: 10 }}>

        <TableRowGroup title="Upload Settings">
          <TableSwitchRow
            label="Always upload to GoFile"
            subLabel="Ignore the 10MB limit to trigger upload"
            value={!!get("alwaysUpload")}
            onValueChange={(v) => {
              set("alwaysUpload", v);
              update();
            }}
          />
          <TableSwitchRow
            label="Copy link to clipboard"
            subLabel="Disable to automatically send link to chat"
            value={!!get("copy")}
            onValueChange={(v) => {
              set("copy", v);
              update();
            }}
          />
          <TableSwitchRow
            label="Insert into the message"
            subLabel="Directly inserts the link into your next message"
            value={!!get("insert")}
            onValueChange={(v) => {
              set("insert", v);
              update();
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="GoFile API Token">
          <Stack spacing={4}>
            <TextInput
              placeholder="Optional: Enter GoFile token for account uploads"
              value={get("gofileToken")}
              onChange={(v) => {
                set("gofileToken", v);
                update();
              }}
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Custom Command Name">
          <Stack spacing={4}>
            <TextInput
              placeholder="Default: /gofile"
              value={get("commandName")}
              onChange={(v) => {
                set("commandName", v);
                update();
              }}
              isClearable
            />
          </Stack>
        </TableRowGroup>

      </Stack>
    </ScrollView>
  );
}