import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { Code2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const SelectLanguage = ({ value, onChange, disabled }: Props) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="w-40">
      <Code2 className="text-muted-foreground mr-2 h-4 w-4" />
      <SelectValue placeholder="Language" />
    </SelectTrigger>

    <SelectContent>
      <SelectGroup>
        <SelectLabel>Languages</SelectLabel>
        <SelectItem value="cpp">C++</SelectItem>
        <SelectItem value="python">Python</SelectItem>
        <SelectItem value="java">Java</SelectItem>
        <SelectItem value="javascript">JavaScript</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);
