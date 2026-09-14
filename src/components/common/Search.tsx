import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function Search({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const effectivePlaceholder = placeholder || t("documentList.searchPlaceholder");
  return (
    <Input
      id="search"
      className={cn("w-1/2 border-primary", className)}
      type="search"
      value={value}
      onChange={onChange}
      placeholder={effectivePlaceholder}
    />
  );
}
