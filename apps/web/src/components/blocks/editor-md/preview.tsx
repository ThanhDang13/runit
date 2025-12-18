// "use client";

// import { LexicalComposer } from "@lexical/react/LexicalComposer";
// import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
// import { ContentEditable } from "@lexical/react/LexicalContentEditable";
// import { editorTheme } from "@web/components/editor/themes/editor-theme";
// import { nodes } from "./nodes";
// import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
// import { Plugins } from "@web/components/blocks/editor-md/plugins";
// import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
// import { EditorState } from "lexical";

// export type EditorPreviewProps = {
//   content: any; // Lexical serialized JSON from DB
//   className?: string;
//   onChange?: (editorState: EditorState) => void;
//   onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
// };

// export function EditorPreview({
//   content,
//   className,
//   onChange,
//   onSerializedChange
// }: EditorPreviewProps) {
//   return (
//     <div
//       className={className ?? "bg-background h-h-full overflow-hidden rounded-lg border p-4 shadow"}
//     >
//       <LexicalComposer
//         initialConfig={{
//           namespace: "Preview",
//           theme: editorTheme,
//           nodes,
//           editable: false,
//           editorState: JSON.stringify(content),
//           onError: console.error
//         }}
//       >
//         {/* <Plugins /> */}
//         <RichTextPlugin
//           contentEditable={<ContentEditable className="prose max-w-full" />}
//           placeholder={null}
//           ErrorBoundary={LexicalErrorBoundary}
//         />
//         <OnChangePlugin
//           ignoreSelectionChange={true}
//           onChange={(editorState) => {
//             onChange?.(editorState);
//             onSerializedChange?.(editorState.toJSON());
//           }}
//         />
//       </LexicalComposer>
//     </div>
//   );
// }

"use client";

import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";

import { editorTheme } from "@web/components/editor/themes/editor-theme";
import { TooltipProvider } from "@web/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";
import { ContentEditable } from "@web/components/editor/editor-ui/content-editable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
  editable: false
};

export function EditorPreview({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
}) {
  return (
    <div className="bg-background overflow-hidden">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState ? { editorState: JSON.stringify(editorSerializedState) } : {})
        }}
      >
        <TooltipProvider>
          {/* <Plugins /> */}
          <RichTextPlugin
            contentEditable={<ContentEditable placeholder="" className="prose m-0 max-w-full" />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />

          {/* <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          /> */}
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
