import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import { Button } from "@/components/ui/button";
import { Loader2, Globe } from "lucide-react";
import { translateText } from "@/services/api/translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TranslatedQuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  theme?: string;
  modules?: any;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TranslatedQuillEditor(props: TranslatedQuillEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ index: number; length: number; bounds: any } | null>(null);
  const [lastCursorIndex, setLastCursorIndex] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Hide floating menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If we clicked inside the editor or inside the popover, don't clear
      const editor = quillRef.current?.getEditor();
      const isInsideEditor = editor ? editor.root.contains(e.target as Node) : false;
      const isInsidePopup = popupRef.current ? popupRef.current.contains(e.target as Node) : false;
      
      if (!isInsideEditor && !isInsidePopup) {
         setSelection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectionChange = (range: any, _source: string, editor: any) => {
    if (range) {
      setLastCursorIndex(range.index + range.length);
      if (range.length > 0) {
        const bounds = editor.getBounds(range.index, range.length);
        setSelection({ index: range.index, length: range.length, bounds });
      } else {
        setSelection(null);
      }
    } else {
      setSelection(null);
    }
  };

  const handleTranslate = async (targetLang: string) => {
    if (!selection || !quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const textToTranslate = editor.getText(selection.index, selection.length);

    setIsTranslating(true);
    try {
      const translated = await translateText(textToTranslate, targetLang);
      
      editor.deleteText(selection.index, selection.length, "user");
      editor.insertText(selection.index, translated, "user");
      editor.setSelection(selection.index, translated.length);
      
      // Update state
      props.onChange(editor.root.innerHTML);
      setSelection(null);
    } catch (error) {
      console.error("Translation failed", error);
      alert("Gagal menerjemahkan teks.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="relative w-full h-full focus-within:z-[99] group/editor">
      <ReactQuill
        ref={quillRef}
        {...props}
        onChange={(content, _delta, source) => {
          if (source === 'user' && props.onChange) {
            props.onChange(content);
          }
        }}
        onChangeSelection={handleSelectionChange}
      />
      
      {selection && !isTranslating && (
        <div
          ref={popupRef}
          className="absolute z-[9999] flex items-center gap-1 bg-white border shadow-md rounded-md p-1"
          style={{
            top: selection.bounds.bottom + 45, // Place it further down to dodge Quill's bubble
            left: Math.max(0, selection.bounds.left - 20),
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent editor blur
        >
          <div className="flex items-center text-xs font-semibold text-muted-foreground mr-1 pl-1">
            <Globe className="w-3 h-3 mr-1" />
            Translate:
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleTranslate("en")}
          >
            EN
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleTranslate("id")}
          >
            ID
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleTranslate("ja")}
          >
            JA
          </Button>
        </div>
      )}
      
      {isTranslating && selection && (
         <div
          className="absolute z-[9999] flex items-center gap-1 bg-white border shadow-md rounded-md p-1 px-3"
         style={{
           top: selection.bounds.bottom + 45,
           left: Math.max(0, selection.bounds.left - 20),
         }}
       >
         <Loader2 className="w-3 h-3 animate-spin mr-2" />
         <span className="text-xs">Menerjemahkan...</span>
       </div>
      )}

      {/* Symbol Picker */}
      <div className="absolute top-1 right-1 opacity-0 group-hover/editor:opacity-100 focus-within:opacity-100 transition-opacity z-[90]">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0 text-[10px] font-bold shadow-sm bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700" 
              title="Insert Symbol"
            >
              Ω
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-2 bg-white" align="end">
            <div className="text-xs font-semibold text-slate-500 mb-2">Pilih Simbol:</div>
            <div className="grid grid-cols-7 gap-1">
              {["°", "±", "√", "Ω", "µ", "α", "β", "π", "∑", "Δ", "™", "©", "®", "≤", "≥", "≠", "∞", "≈", "÷", "×", "✓", "²", "³", "₂", "₃"].map(sym => (
                <Button 
                  key={sym}
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="h-8 p-0 text-base hover:bg-slate-100"
                  onClick={() => {
                    const editor = quillRef.current?.getEditor();
                    if (editor) {
                      const idx = lastCursorIndex !== null ? lastCursorIndex : editor.getLength();
                      editor.insertText(idx, sym, "user");
                      editor.setSelection(idx + 1);
                      setLastCursorIndex(idx + 1);
                      props.onChange(editor.root.innerHTML);
                    }
                  }}
                >
                  {sym}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </div>
  );
}
