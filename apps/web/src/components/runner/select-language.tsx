import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { Badge } from "@web/components/ui/badge";
import { ExecuteRequest } from "@web/lib/tanstack/options/execute";

interface Props {
  value: string;
  onChange: (val: ExecuteRequest["language"]) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { value: "python", label: "Python", icon: "Py", color: "bg-blue-500" },
  { value: "javascript", label: "JavaScript", icon: "JS", color: "bg-yellow-500" },
  { value: "java", label: "Java", icon: "Jv", color: "bg-orange-500" },
  { value: "cpp", label: "C++", icon: "C++", color: "bg-purple-500" }
] as const;

export const SelectLanguage = ({ value, onChange, disabled }: Props) => {
  const selectedLanguage = LANGUAGES.find((lang) => lang.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-35 gap-2 text-xs">
        {selectedLanguage && (
          <>
            {/* <span className="text-base leading-none">{selectedLanguage.icon}</span> */}
            <span className="font-medium">{selectedLanguage.label}</span>
          </>
        )}
        {!selectedLanguage && <SelectValue placeholder="Select language" />}
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value} className="cursor-pointer">
              <div className="flex items-center gap-2">
                {/* <span className="text-base leading-none">{lang.icon}</span> */}
                <span className="font-medium">{lang.label}</span>
                {/* <div className={`ml-auto h-2 w-2 rounded-full ${lang.color}`} /> */}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
