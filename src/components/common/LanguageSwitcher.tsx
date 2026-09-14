import { useLanguage } from "@/context/LanguageContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";

/** UK Flag SVG — compact inline */
function UKFlag({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className={className}
      aria-label="English"
    >
      <clipPath id="uk-clip">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-clip)" />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

/** Indonesia Flag SVG — compact inline */
function IndonesiaFlag({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 40"
      className={className}
      aria-label="Bahasa Indonesia"
    >
      <rect width="60" height="20" fill="#FF0000" />
      <rect y="20" width="60" height="20" fill="#FFFFFF" />
    </svg>
  );
}

/** Japan Flag SVG */
function JapanFlag({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 40"
      className={className}
      aria-label="日本語"
    >
      <rect width="60" height="40" fill="#FFFFFF" />
      <circle cx="30" cy="20" r="12" fill="#BC002D" />
    </svg>
  );
}

const languages = [
  { code: "en" as const, label: "English", Flag: UKFlag },
  { code: "id" as const, label: "Bahasa Indonesia", Flag: IndonesiaFlag },
  { code: "ja" as const, label: "日本語", Flag: JapanFlag },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full overflow-hidden ring-1 ring-border hover:ring-primary/40 transition-all duration-300"
          title={currentLang.label}
        >
          <currentLang.Flag className="w-5 h-5 rounded-sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-1.5 rounded-xl shadow-xl border-muted/50"
        align="end"
      >
        {languages.map(({ code, label, Flag }) => (
          <button
            key={code}
            onClick={() => {
              setLanguage(code);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              language === code
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/50 text-foreground"
            }`}
          >
            <Flag className="w-6 h-4 rounded-[3px] shadow-sm border border-black/10 flex-shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {language === code && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
