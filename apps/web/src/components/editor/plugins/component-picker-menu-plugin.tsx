import { JSX, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useBasicTypeaheadTriggerMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import { createPortal } from "react-dom";

import { useEditorModal } from "@web/components/editor/editor-hooks/use-modal";
import { Command, CommandGroup, CommandItem, CommandList } from "@web/components/ui/command";

import { ComponentPickerOption } from "./picker/component-picker-option";
import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { ScrollArea } from "@web/components/ui/scroll-area";

export const LexicalTypeaheadMenuPlugin = lazy(async () => {
  if (typeof window === "undefined") {
    return { default: () => null };
  }
  const mod = await import("@lexical/react/LexicalTypeaheadMenuPlugin");
  return { default: mod.LexicalTypeaheadMenuPlugin };
});

function ComponentPickerMenu({
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex
}: {
  options: Array<ComponentPickerOption>;
  selectedIndex: number | null;
  selectOptionAndCleanUp: (option: ComponentPickerOption) => void;
  setHighlightedIndex: (index: number) => void;
}) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (selectedIndex !== null && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "auto"
      });
    }
  }, [selectedIndex]);

  return (
    <div className="absolute z-10 h-min w-[250px] rounded-md shadow-md">
      <Command
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex(
              selectedIndex !== null
                ? (selectedIndex - 1 + options.length) % options.length
                : options.length - 1
            );
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(selectedIndex !== null ? (selectedIndex + 1) % options.length : 0);
          }
        }}
      >
        <ScrollArea className="bg-popover min-h-60 w-full rounded-md border">
          <CommandList className="h-full min-w-full overflow-visible">
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={option.key}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  value={option.title}
                  onSelect={() => selectOptionAndCleanUp(option)}
                  className={`flex items-center gap-2 px-2 py-1 ${
                    selectedIndex === index ? "bg-accent text-accent-foreground" : "text-foreground"
                  }`}
                >
                  {option.icon}
                  {option.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  );
}

export function ComponentPickerMenuPlugin({
  baseOptions = [],
  dynamicOptionsFn
}: {
  baseOptions?: Array<ComponentPickerOption>;
  dynamicOptionsFn?: ({ queryString }: { queryString: string }) => Array<ComponentPickerOption>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0
  });

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...(dynamicOptionsFn?.({ queryString }) || []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword))
      )
    ];
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      option: MenuOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      const selectedOption = option as ComponentPickerOption; // cast safely
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString, editor, showModal);
        closeMenu();
      });
    },
    [editor, showModal]
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) => {
          return anchorElementRef.current && options.length
            ? createPortal(
                <ComponentPickerMenu
                  options={options}
                  selectedIndex={selectedIndex}
                  selectOptionAndCleanUp={selectOptionAndCleanUp}
                  setHighlightedIndex={setHighlightedIndex}
                />,
                anchorElementRef.current
              )
            : null;
        }}
      />
    </>
  );
}
