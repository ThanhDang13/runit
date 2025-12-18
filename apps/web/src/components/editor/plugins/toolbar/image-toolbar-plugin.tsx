"use client";

import { ImageIcon } from "lucide-react";

import { useToolbarContext } from "@web/components/editor/context/toolbar-context";
import { InsertImageDialog } from "@web/components/editor/plugins/images-plugin";
import { Button } from "@web/components/ui/button";

export function ImageToolbarPlugin() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <Button
      onClick={(e) => {
        showModal("Insert Image", (onClose) => (
          <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
        ));
      }}
      variant={"outline"}
      size="icon"
      className=""
    >
      <ImageIcon className="size-4" />
    </Button>
  );
}
