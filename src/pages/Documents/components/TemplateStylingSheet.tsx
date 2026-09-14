import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface TemplateStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  headerBgColor: string;
  borderColor: string;
  borderWidth: number;
  cellPadding: number;
  rowMinHeight: number;
  colWidths: {
    no: number;
    steps: number;
    checkPoints: number;
    images: number;
  };
}

export const DEFAULT_STYLE: TemplateStyle = {
  fontFamily: "Arial",
  fontSize: 11,
  textColor: "#000000",
  headerBgColor: "#ffe699",
  borderColor: "#000000",
  borderWidth: 1,
  cellPadding: 6,
  rowMinHeight: 60,
  colWidths: {
    no: 5,
    steps: 45,
    checkPoints: 25,
    images: 25,
  },
};

const FONT_OPTIONS = [
  "Arial",
  "Times New Roman",
  "Calibri",
  "Verdana",
  "Tahoma",
  "Georgia",
  "Courier New",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  style: TemplateStyle;
  onStyleChange: (s: TemplateStyle) => void;
}

export default function TemplateStylingSheet({
  open,
  onOpenChange,
  style,
  onStyleChange,
}: Props) {
  const update = <K extends keyof TemplateStyle>(
    key: K,
    val: TemplateStyle[K]
  ) => {
    onStyleChange({ ...style, [key]: val });
  };

  const updateColWidth = (
    col: keyof TemplateStyle["colWidths"],
    val: number
  ) => {
    onStyleChange({
      ...style,
      colWidths: { ...style.colWidths, [col]: val },
    });
  };

  const totalColWidth =
    style.colWidths.no +
    style.colWidths.steps +
    style.colWidths.checkPoints +
    style.colWidths.images;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Toggle Header */}
      <Button
        variant="ghost"
        onClick={() => onOpenChange(!open)}
        className="w-full flex items-center justify-between px-4 py-3 h-auto hover:bg-slate-50 rounded-none"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Template Styling
          </span>
          <span className="text-xs text-muted-foreground">
            — Atur tampilan template
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ── Typography ── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Typography
                  </h3>
                  <Separator />

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Font Family</Label>
                      <Select
                        value={style.fontFamily}
                        onValueChange={(v) => update("fontFamily", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Size (px)</Label>
                        <Input
                          type="number"
                          min={8}
                          max={24}
                          className="h-8 text-xs"
                          value={style.fontSize}
                          onChange={(e) =>
                            update("fontSize", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Text Color</Label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={style.textColor}
                            onChange={(e) =>
                              update("textColor", e.target.value)
                            }
                            className="w-8 h-8 rounded border cursor-pointer shrink-0"
                          />
                          <Input
                            value={style.textColor}
                            onChange={(e) =>
                              update("textColor", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Borders & Colors ── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Borders & Colors
                  </h3>
                  <Separator />

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Header Background</Label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={style.headerBgColor}
                          onChange={(e) =>
                            update("headerBgColor", e.target.value)
                          }
                          className="w-8 h-8 rounded border cursor-pointer shrink-0"
                        />
                        <Input
                          value={style.headerBgColor}
                          onChange={(e) =>
                            update("headerBgColor", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Border Color</Label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={style.borderColor}
                            onChange={(e) =>
                              update("borderColor", e.target.value)
                            }
                            className="w-8 h-8 rounded border cursor-pointer shrink-0"
                          />
                          <Input
                            value={style.borderColor}
                            onChange={(e) =>
                              update("borderColor", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Width (px)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          className="h-8 text-xs"
                          value={style.borderWidth}
                          onChange={(e) =>
                            update("borderWidth", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Spacing ── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Spacing
                  </h3>
                  <Separator />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Cell Padding</Label>
                      <Input
                        type="number"
                        min={2}
                        max={20}
                        className="h-8 text-xs"
                        value={style.cellPadding}
                        onChange={(e) =>
                          update("cellPadding", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Row Height</Label>
                      <Input
                        type="number"
                        min={30}
                        max={200}
                        className="h-8 text-xs"
                        value={style.rowMinHeight}
                        onChange={(e) =>
                          update("rowMinHeight", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* ── Column Widths ── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Column Widths (%)
                  </h3>
                  <Separator />

                  <p className="text-xs text-muted-foreground">
                    Total:{" "}
                    <strong
                      className={
                        totalColWidth === 100
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {totalColWidth}%
                    </strong>
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">No</Label>
                      <Input
                        type="number"
                        min={3}
                        max={15}
                        className="h-8 text-xs"
                        value={style.colWidths.no}
                        onChange={(e) =>
                          updateColWidth("no", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Langkah Kerja</Label>
                      <Input
                        type="number"
                        min={20}
                        max={70}
                        className="h-8 text-xs"
                        value={style.colWidths.steps}
                        onChange={(e) =>
                          updateColWidth("steps", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Point Check</Label>
                      <Input
                        type="number"
                        min={10}
                        max={40}
                        className="h-8 text-xs"
                        value={style.colWidths.checkPoints}
                        onChange={(e) =>
                          updateColWidth("checkPoints", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Gambar Kerja</Label>
                      <Input
                        type="number"
                        min={10}
                        max={40}
                        className="h-8 text-xs"
                        value={style.colWidths.images}
                        onChange={(e) =>
                          updateColWidth("images", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
