import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SerializedEditorState } from "lexical";
import { Editor } from "@web/components/blocks/editor-md/editor";
import { EditorPreview } from "@web/components/blocks/editor-md/preview";

export const Route = createFileRoute("/editor")({
  component: EditorPage
});

export const initialValue: SerializedEditorState = {
  root: {
    type: "root",
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 4,
    children: [
      {
        type: "list",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        listType: "check",
        start: 1,
        tag: "ul",
        children: [
          {
            type: "listitem",
            version: 1,
            direction: null,
            format: "",
            indent: 0,
            textFormat: 4,
            checked: false,
            value: 1,
            children: [
              {
                type: "text",
                version: 1,
                detail: 0,
                format: 4,
                mode: "normal",
                style: "",
                text: "Hello World 🚀"
              }
            ]
          }
        ]
      }
    ]
  }
} as unknown as SerializedEditorState;
export default function EditorPage() {
  const [editorState, setEditorState] = useState<SerializedEditorState>(initialValue);
  return (
    <div className="flex flex-row">
      <Editor
        editorSerializedState={editorState}
        onSerializedChange={(value) => {
          setEditorState(value);
          console.log(value);
        }}
      />
      <EditorPreview
        editorSerializedState={editorState}
        onSerializedChange={(value) => {
          setEditorState(value);
        }}
      />
    </div>
  );
}
