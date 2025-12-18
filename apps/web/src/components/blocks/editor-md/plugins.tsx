import { useState } from "react";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS
} from "@lexical/markdown";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import { ContentEditable } from "@web/components/editor/editor-ui/content-editable";
import { AutoLinkPlugin } from "@web/components/editor/plugins/auto-link-plugin";
import { CodeActionMenuPlugin } from "@web/components/editor/plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "@web/components/editor/plugins/code-highlight-plugin";
import { ComponentPickerMenuPlugin } from "@web/components/editor/plugins/component-picker-menu-plugin";
import { DraggableBlockPlugin } from "@web/components/editor/plugins/draggable-block-plugin";
import { FloatingLinkEditorPlugin } from "@web/components/editor/plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "@web/components/editor/plugins/floating-text-format-plugin";
import { ImagesPlugin } from "@web/components/editor/plugins/images-plugin";
import { LinkPlugin } from "@web/components/editor/plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "@web/components/editor/plugins/list-max-indent-level-plugin";
import { AlignmentPickerPlugin } from "@web/components/editor/plugins/picker/alignment-picker-plugin";
import { BulletedListPickerPlugin } from "@web/components/editor/plugins/picker/bulleted-list-picker-plugin";
import { CheckListPickerPlugin } from "@web/components/editor/plugins/picker/check-list-picker-plugin";
import { CodePickerPlugin } from "@web/components/editor/plugins/picker/code-picker-plugin";
import { DividerPickerPlugin } from "@web/components/editor/plugins/picker/divider-picker-plugin";
import { HeadingPickerPlugin } from "@web/components/editor/plugins/picker/heading-picker-plugin";
import { ImagePickerPlugin } from "@web/components/editor/plugins/picker/image-picker-plugin";
import { NumberedListPickerPlugin } from "@web/components/editor/plugins/picker/numbered-list-picker-plugin";
import { ParagraphPickerPlugin } from "@web/components/editor/plugins/picker/paragraph-picker-plugin";
import { QuotePickerPlugin } from "@web/components/editor/plugins/picker/quote-picker-plugin";
import { TablePickerPlugin } from "@web/components/editor/plugins/picker/table-picker-plugin";
import { BlockFormatDropDown } from "@web/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatBulletedList } from "@web/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@web/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatCodeBlock } from "@web/components/editor/plugins/toolbar/block-format/format-code-block";
import { FormatHeading } from "@web/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@web/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatParagraph } from "@web/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatQuote } from "@web/components/editor/plugins/toolbar/block-format/format-quote";
import { CodeLanguageToolbarPlugin } from "@web/components/editor/plugins/toolbar/code-language-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "@web/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@web/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { HistoryToolbarPlugin } from "@web/components/editor/plugins/toolbar/history-toolbar-plugin";
import { HorizontalRuleToolbarPlugin } from "@web/components/editor/plugins/toolbar/horizontal-rule-toolbar-plugin";
import { ImageToolbarPlugin } from "@web/components/editor/plugins/toolbar/image-toolbar-plugin";
import { LinkToolbarPlugin } from "@web/components/editor/plugins/toolbar/link-toolbar-plugin";
import { TableToolbarPlugin } from "@web/components/editor/plugins/toolbar/table-toolbar-plugin";
import { ToolbarPlugin } from "@web/components/editor/plugins/toolbar/toolbar-plugin";
import { HR } from "@web/components/editor/transformers/markdown-hr-transformer";
import { IMAGE } from "@web/components/editor/transformers/markdown-image-transformer";
import { TABLE } from "@web/components/editor/transformers/markdown-table-transformer";
import { ScrollArea } from "@web/components/ui/scroll-area";

const placeholder = "Press / for commands...";

export function Plugins({}) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>
            {blockType === "code" ? (
              <CodeLanguageToolbarPlugin />
            ) : (
              <>
                <ElementFormatToolbarPlugin separator={false} />
                <FontFormatToolbarPlugin />
                <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />

                <HorizontalRuleToolbarPlugin />
                {/* <ImageToolbarPlugin /> */}
                <TableToolbarPlugin />
              </>
            )}
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="h-[calc(100vh-50px)] min-h-72" ref={onRef}>
              <ScrollArea className="bg-background h-full w-full rounded-md border">
                <ContentEditable
                  placeholder={placeholder}
                  className="ContentEditable__root block min-h-full w-full p-4 focus:outline-none"
                />
              </ScrollArea>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />

        <ListPlugin />
        <ListMaxIndentLevelPlugin />
        <CheckListPlugin />

        <TabIndentationPlugin />

        <ClickableLinkPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />

        <FloatingLinkEditorPlugin
          anchorElem={floatingAnchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />

        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        <CodeHighlightPlugin />

        <ComponentPickerMenuPlugin
          baseOptions={[
            ParagraphPickerPlugin(),
            HeadingPickerPlugin({ n: 1 }),
            HeadingPickerPlugin({ n: 2 }),
            HeadingPickerPlugin({ n: 3 }),
            TablePickerPlugin(),
            CheckListPickerPlugin(),
            NumberedListPickerPlugin(),
            BulletedListPickerPlugin(),
            QuotePickerPlugin(),
            CodePickerPlugin(),
            DividerPickerPlugin(),
            // ImagePickerPlugin(),
            AlignmentPickerPlugin({ alignment: "left" }),
            AlignmentPickerPlugin({ alignment: "center" }),
            AlignmentPickerPlugin({ alignment: "right" }),
            AlignmentPickerPlugin({ alignment: "justify" })
          ]}
        />

        <FloatingTextFormatToolbarPlugin
          anchorElem={floatingAnchorElem}
          setIsLinkEditMode={setIsLinkEditMode}
        />

        <HorizontalRulePlugin />

        {/* <ImagesPlugin /> */}

        <TablePlugin />

        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />

        <MarkdownShortcutPlugin
          transformers={[
            TABLE,
            HR,
            IMAGE,
            CHECK_LIST,
            ...ELEMENT_TRANSFORMERS,
            ...MULTILINE_ELEMENT_TRANSFORMERS,
            ...TEXT_FORMAT_TRANSFORMERS,
            ...TEXT_MATCH_TRANSFORMERS
          ]}
        />
      </div>
    </div>
  );
}
