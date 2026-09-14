import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Loader2, Undo2 } from "lucide-react";
import TranslatedQuillEditor from './TranslatedQuillEditor';
import 'react-quill-new/dist/quill.bubble.css';
import { uploadWiImage, getDocuments } from "@/services/api/documents";
import { getDepartments } from "@/services/api/departments";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import TemplateStylingSheet, {
  DEFAULT_STYLE,
  type TemplateStyle,
} from "./TemplateStylingSheet";
import artienceLogo from "@/assets/artience.png";

/* ───── Interfaces ───── */
export interface TopSection {
  id: string;
  title: string;
  text: string;
  attachments?: Attachment[];
}

export interface Step {
  id: string;
  stepText: string;
  checkPointText: string;
  image: string; // Legacy
  images?: string[]; 
}

export interface Section {
  id: string;
  title: string;
  steps: Step[];
  isContinued?: boolean;
  isSectionless?: boolean;
}

export interface Attachment {
  id: string;
  text: string;
  code?: string;
}

export interface PageData {
  id: string;
  sections: Section[];
}

const quillModules = {
  toolbar: [
    ['bold', 'italic'],
    [{ 'color': ['#000000', '#4472C4'] }]
  ]
};

export interface TemplateData {
  topSections?: TopSection[];
  instructionText?: string;
  sections: Section[];
  attachments: Attachment[];
  style: TemplateStyle;
  pages?: PageData[];
}

interface BuilderProps {
  data: TemplateData;
  onChange: (data: TemplateData) => void;
  documentName?: string;
  onDocumentNameChange?: (name: string) => void;
}

/* ───── Helpers ───── */
const uid = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_TOP_SECTIONS: TopSection[] = [
  { id: uid(), title: "Tujuan / Purpose", text: "" },
  { id: uid(), title: "Ruang Lingkup / Scope", text: "" },
  { id: uid(), title: "Referensi / Reference", text: "" },
  { id: uid(), title: "Alat Pelindung Diri (APD) / Personal Protective Equipment (PPE)", text: "" },
];

export default function WorkInstructionBuilder({
  data,
  onChange,
  documentName = "",
  onDocumentNameChange,
}: BuilderProps) {
  const topSections = data.topSections?.length ? data.topSections : DEFAULT_TOP_SECTIONS;
  const instructionText = data.instructionText || "";
  const attachments = data.attachments || [];
  const style = data.style || DEFAULT_STYLE;

  const sections = data.sections || [];

  const dataRef = React.useRef(data);
  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ── Undo Feature State ──
  const [history, setHistoryState] = useState<TemplateData[]>([data]);
  const historyRef = React.useRef<TemplateData[]>([data]);
  const isUndoingRef = React.useRef(false);
  const undoTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [hasPendingUndo, setHasPendingUndo] = useState(false);

  const setHistory = (action: (prev: TemplateData[]) => TemplateData[]) => {
    setHistoryState(prev => {
      const next = action(prev);
      historyRef.current = next;
      return next;
    });
  };

  React.useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }
    
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    
    const lastHistory = historyRef.current[historyRef.current.length - 1];
    const isDifferent = JSON.stringify(lastHistory) !== JSON.stringify(data);
    
    if (isDifferent) {
      setHasPendingUndo(true);
    }
    
    undoTimeoutRef.current = setTimeout(() => {
      undoTimeoutRef.current = null;
      setHasPendingUndo(false);
      if (isDifferent) {
        setHistory(prev => {
          const newHistory = [...prev, data];
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
        });
      }
    }, 1000);
    
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, [data]);

  const handleUndo = () => {
    let hasPending = false;
    if (undoTimeoutRef.current) {
       clearTimeout(undoTimeoutRef.current);
       undoTimeoutRef.current = null;
       setHasPendingUndo(false);
       hasPending = true;
    }
    
    if (hasPending) {
       if (historyRef.current.length > 0) {
         isUndoingRef.current = true;
         onChange(historyRef.current[historyRef.current.length - 1]);
       }
    } else {
       if (historyRef.current.length > 1) {
         const previousState = historyRef.current[historyRef.current.length - 2];
         isUndoingRef.current = true;
         setHistory(prev => prev.slice(0, prev.length - 1));
         onChange(previousState);
       }
    }
  };

  const currentDateStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  // Calculate global numbering for sections and steps
  const sectionNumbers = new Map<string, number>();
  const stepNumbers = new Map<string, number>();
  let globalMajor = 0;
  let globalMinor = 0;
  
  sections.forEach(sec => {
    if (!sec.isContinued) {
      globalMajor++;
      globalMinor = 0;
    }
    sectionNumbers.set(sec.id, globalMajor);

    sec.steps.forEach(step => {
      globalMinor++;
      stepNumbers.set(step.id, globalMinor);
    });
  });

  const [stylingOpen, setStylingOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // stepId being uploaded

  const pageRef = React.useRef<HTMLDivElement>(null);

  // State for Attachment Autocomplete
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);
  const [activeAttachmentCategory, setActiveAttachmentCategory] = useState<string>("");
  const [attachmentSearch, setAttachmentSearch] = useState("");
  const [docOptions, setDocOptions] = useState<any[]>([]);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const authUser = useAppSelector((state: any) => state.authUser);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");

  React.useEffect(() => {
    getDepartments(1, 100, "").then((res) => {
      setDepartments(res.departments || []);
    }).catch(console.error);
  }, []);

  const fetchDocs = async (search: string, deptId: string, category?: string) => {
    try {
      const parsedDeptId = deptId === "all" ? undefined : deptId;
      const params: any = { search, limit: 500, departmentId: parsedDeptId };
      if (category) params.category = category;
      const res = await getDocuments(params);
      setDocOptions(res.documents || []);
    } catch (e) {
      console.error("Failed to fetch docs for autocomplete", e);
    }
  };

  React.useEffect(() => {
    const defaultDept = authUser?.departmentIds?.[0] ? String(authUser.departmentIds[0]) : "all";
    setSelectedDepartmentId(defaultDept);
    fetchDocs("", defaultDept, activeAttachmentCategory);
  }, [authUser]);

  const handleAttachmentSearch = (val: string, deptId?: string, category?: string) => {
    const currentDeptId = deptId || selectedDepartmentId;
    const cat = category !== undefined ? category : activeAttachmentCategory;
    setAttachmentSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchDocs(val, currentDeptId, cat);
    }, 300);
  };

  const handleDepartmentChange = (val: string) => {
    setSelectedDepartmentId(val);
    fetchDocs(attachmentSearch, val, activeAttachmentCategory);
  };

  /* ── Updaters ── */
  const emit = (
    ts: TopSection[],
    it: string,
    s: Section[],
    a: Attachment[],
    st: TemplateStyle = style
  ) => {
    onChange({
      topSections: ts,
      instructionText: it,
      sections: s,
      attachments: a,
      style: st,
    });
  };



  // topSections
  const updateTopSection = (id: string, text: string) => {
    emit(
      topSections.map((ts) => (ts.id === id ? { ...ts, text } : ts)),
      instructionText,
      sections,
      attachments
    );
  };

  const addTopSectionAttachment = (tsId: string) => {
    emit(
      topSections.map((ts) =>
        ts.id === tsId
          ? {
              ...ts,
              attachments: [...(ts.attachments || []), { id: uid(), text: "", code: "" }],
            }
          : ts
      ),
      instructionText,
      sections,
      attachments
    );
  };

  const removeTopSectionAttachment = (tsId: string, aId: string) => {
    emit(
      topSections.map((ts) =>
        ts.id === tsId
          ? {
              ...ts,
              attachments: (ts.attachments || []).filter((a) => a.id !== aId),
            }
          : ts
      ),
      instructionText,
      sections,
      attachments
    );
  };

  const updateTopSectionAttachment = (tsId: string, aId: string, val: string, code?: string) => {
    emit(
      topSections.map((ts) =>
        ts.id === tsId
          ? {
              ...ts,
              attachments: (ts.attachments || []).map((a) => {
                if (a.id === aId) {
                  const newA = { ...a, text: val };
                  if (code !== undefined) newA.code = code;
                  return newA;
                }
                return a;
              }),
            }
          : ts
      ),
      instructionText,
      sections,
      attachments
    );
  };


  // sections (scoped to current page)
  const addSection = () => {
    const newSections = [
      ...sections,
      {
        id: uid(),
        title: "",
        steps: [
              { id: uid(), stepText: "", checkPointText: "", image: "", images: [] },
        ],
      },
    ];
    emit(topSections, instructionText, newSections, attachments);
  };

  const addSectionless = () => {
    const existingSectionless = sections.find(s => s.isSectionless);
    if (existingSectionless) {
      // Add a new step to the existing sectionless section
      const newSections = sections.map(s =>
        s.id === existingSectionless.id
          ? {
              ...s,
              steps: [
                ...s.steps,
                { id: uid(), stepText: "", checkPointText: "", image: "", images: [] },
              ],
            }
          : s
      );
      emit(topSections, instructionText, newSections, attachments);
    } else {
      // Create a new sectionless section
      const newSections = [
        ...sections,
        {
          id: uid(),
          title: "",
          isSectionless: true,
          steps: [
                { id: uid(), stepText: "", checkPointText: "", image: "", images: [] },
          ],
        },
      ];
      emit(topSections, instructionText, newSections, attachments);
    }
  };

  const addSectionAfter = (afterId: string) => {
    const currentSections = [...sections];
    const index = currentSections.findIndex(s => s.id === afterId);
    const newSection = {
      id: uid(),
      title: "",
      steps: [
        { id: uid(), stepText: "", checkPointText: "", image: "", images: [] },
      ],
    };
    
    if (index !== -1) {
      currentSections.splice(index + 1, 0, newSection);
    } else {
      currentSections.push(newSection);
    }
    
    emit(topSections, instructionText, currentSections, attachments);
  };

  const removeSection = (sId: string) =>
    emit(topSections, instructionText, sections.filter((s) => s.id !== sId), attachments);

  const updateSectionTitle = (sId: string, val: string) =>
    emit(
      topSections,
      instructionText,
      sections.map((s) => (s.id === sId ? { ...s, title: val } : s)),
      attachments
    );

  // steps
  const addStep = (sId: string) =>
    emit(
      topSections,
      instructionText,
      sections.map((s) =>
        s.id === sId
          ? {
              ...s,
              steps: [
                ...s.steps,
                    { id: uid(), stepText: "", checkPointText: "", image: "", images: [] },
              ],
            }
          : s
      ),
      attachments
    );

  const addStepAfter = (sId: string, afterStepId: string) => {
    emit(
      topSections,
      instructionText,
      sections.map((s) => {
        if (s.id === sId) {
          const index = s.steps.findIndex((st) => st.id === afterStepId);
          const newSteps = [...s.steps];
          const newStep = { id: uid(), stepText: "", checkPointText: "", image: "", images: [] };
          if (index !== -1) {
            newSteps.splice(index + 1, 0, newStep);
          } else {
            newSteps.push(newStep);
          }
          return { ...s, steps: newSteps };
        }
        return s;
      }),
      attachments
    );
  };

  const removeStep = (sId: string, stepId: string) =>
    emit(
      topSections,
      instructionText,
      sections.map((s) =>
        s.id === sId
          ? { ...s, steps: s.steps.filter((st) => st.id !== stepId) }
          : s
      ),
      attachments
    );

  const updateStep = (
    sId: string,
    stepId: string,
    field: keyof Step,
    val: string
  ) =>
    emit(
      topSections,
      instructionText,
      sections.map((s) =>
        s.id === sId
          ? {
              ...s,
              steps: s.steps.map((st) =>
                st.id === stepId ? { ...st, [field]: val } : st
              ),
            }
          : s
      ),
      attachments
    );

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sId: string,
    stepId: string
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingImage(stepId);
    try {
      const result = await uploadWiImage(f);
      
      // Use latest data from ref to prevent overwriting user typing during upload
      const latestData = dataRef.current;
      const latestSections = latestData.sections || [];
      
      const section = latestSections.find(s => s.id === sId);
      const step = section?.steps.find(st => st.id === stepId);
      const currentImages = step?.images || (step?.image ? [step.image] : []);
      
      const newImages = [...currentImages, result.imageUrl];
      
      const newSections = latestSections.map((s) =>
        s.id === sId
          ? {
              ...s,
              steps: s.steps.map((st) =>
                st.id === stepId ? { ...st, images: newImages } : st
              ),
            }
          : s
      );
      
      onChange({
        ...latestData,
        sections: newSections,
      });
      
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImage(null);
    }
  };

  const removeImage = (sId: string, stepId: string, imgIndex: number) => {
    const section = sections.find(s => s.id === sId);
    const step = section?.steps.find(st => st.id === stepId);
    if (!step) return;
    const currentImages = step.images || (step.image ? [step.image] : []);
    const newImages = currentImages.filter((_, i) => i !== imgIndex);
    updateStep(sId, stepId, "images", newImages as any);
  };

  // attachments
  const addAttachment = () =>
    emit(topSections, instructionText, sections, [...attachments, { id: uid(), text: "", code: "" }]);

  const removeAttachment = (aId: string) =>
    emit(topSections, instructionText, sections, attachments.filter((a) => a.id !== aId));

  const updateAttachment = (aId: string, val: string, code?: string) =>
    emit(
      topSections,
      instructionText,
      sections,
      attachments.map((a) => {
        if (a.id === aId) {
          const newA = { ...a, text: val };
          if (code !== undefined) {
            newA.code = code;
          }
          return newA;
        }
        return a;
      })
    );

  /* ── Derived inline styles from the "style" object ── */
  const cellStyle: React.CSSProperties = {
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    padding: style.cellPadding,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    color: style.textColor,
  };

  const headerBg: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: style.headerBgColor,
    fontWeight: "bold",
  };

  return (
    <>
      {/* Styling panel — inline above the builder */}
      <TemplateStylingSheet
        open={stylingOpen}
        onOpenChange={setStylingOpen}
        style={style}
        onStyleChange={(s) => emit(topSections, instructionText, sections, attachments, s)}
      />

      <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200 mt-3 shadow-inner">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <div>
            <Label className="text-base font-bold text-primary">
              Work Instruction Builder
            </Label>
            <p className="text-xs text-muted-foreground">
              Klik <strong>+ Add Section</strong> untuk menambah bagian baru (otomatis bernomor 1, 2…). Tiap section bisa ditambah baris (<strong>+ Row</strong>).
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={handleUndo} disabled={history.length <= 1 && !hasPendingUndo}>
              <Undo2 className="w-4 h-4 mr-1" /> Undo
            </Button>
            {sections.some(s => s.isSectionless) ? (
              <Button size="sm" variant="outline" onClick={addSectionless}>
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={addSection}>
                <Plus className="w-4 h-4 mr-1" /> Add Section
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={addAttachment}>
              <Plus className="w-4 h-4 mr-1" /> Add Attachment
            </Button>
          </div>
        </div>

        {/* ── Preview Table Wrapper (Simulates paper margins) ── */}
        <div className="bg-slate-200/50 p-4 sm:p-8 md:p-12 rounded-b-xl border-t border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] overflow-x-auto overflow-y-auto max-h-[85vh] relative">
          
          {/* ── Document Paper Container ── */}
          <div
            ref={pageRef}
            className="bg-white border-[3px] border-[#000080] p-[2px] shadow-sm mx-auto w-[98%] max-w-[900px] min-h-[1131px] relative"
            style={{ 
              fontFamily: style.fontFamily, 
              fontSize: style.fontSize, 
              color: style.textColor, 
              borderColor: style.borderColor,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone" 
            }}
          >
          {/* Header */}
          <table
            className="w-full border-collapse"
            style={{ borderColor: style.borderColor }}
          >
            <tbody>
              {/* Row 1: Logo & Title */}
              <tr>
                <td
                  style={{ ...cellStyle, width: "25%", textAlign: "center", verticalAlign: "middle" }}
                  className="border"
                >
                  <img src={artienceLogo} alt="artience" className="max-h-12 w-auto mx-auto block" />
                </td>
                <td
                  colSpan={3}
                  style={{ ...cellStyle, width: "75%", textAlign: "center", verticalAlign: "middle", color: "#000080" }}
                  className="border"
                >
                  <strong className="block text-sm">
                    INSTRUKSI KERJA / WORK INSTRUCTION
                  </strong>
                  {onDocumentNameChange ? (
                    <input
                      className="block w-full text-center text-[15px] mt-1 uppercase font-bold bg-transparent outline-none border border-transparent hover:border-blue-300 focus:border-blue-500 rounded px-1 transition-colors placeholder:normal-case placeholder:font-normal placeholder:text-blue-300/70"
                      style={{ color: "#000080", fontFamily: style.fontFamily }}
                      placeholder="Ketik nama dokumen di sini..."
                      value={documentName}
                      onChange={(e) => onDocumentNameChange(e.target.value)}
                    />
                  ) : (
                    <strong className="block text-[15px] mt-1 uppercase">
                      <span>{documentName || <span className="text-blue-300/50 font-normal normal-case text-sm">Nama dokumen belum diisi</span>}</span>
                    </strong>
                  )}
                </td>
              </tr>
              {/* Row 2: Metadata */}
              <tr>
                <td
                  style={{ ...cellStyle, width: "25%", textAlign: "center", verticalAlign: "middle", padding: "4px" }}
                  className="border text-xs"
                >
                  No. Dokumen : (auto)
                </td>
                <td
                  style={{ ...cellStyle, width: "35%", textAlign: "center", verticalAlign: "middle", padding: "4px" }}
                  className="border text-xs"
                >
                  Tanggal Efektif : {currentDateStr}
                </td>
                <td
                  style={{ ...cellStyle, width: "20%", textAlign: "center", verticalAlign: "middle", padding: "4px" }}
                  className="border text-xs"
                >
                  Status revisi : (auto)
                </td>
                <td
                  style={{ ...cellStyle, width: "20%", textAlign: "center", verticalAlign: "middle", padding: "4px" }}
                  className="border text-xs"
                >
                  Hal : 1 dari 1
                </td>
              </tr>
            </tbody>
          </table>


              <table
                className="w-full border-collapse mt-[-1px] table-fixed"
                style={{ borderColor: style.borderColor }}
              >
            <tbody>
              {topSections.map((ts, idx) => {
                const isReference = ts.title.toLowerCase().includes("referensi") || ts.title.toLowerCase().includes("reference");
                
                return (
                  <React.Fragment key={ts.id}>
                    <tr>
                      <td
                        style={{ ...headerBg, width: `${style.colWidths.no}%`, textAlign: "center" }}
                        className="border"
                      >
                        {idx + 1}.
                      </td>
                      <td colSpan={3} style={headerBg} className="border p-2">
                        <div className="flex justify-between items-center">
                          <div>
                            {ts.title.includes(" / ") ? (
                              <>
                                {ts.title.split(" / ")[0]} / <span className="text-blue-900 italic font-normal">{ts.title.split(" / ")[1]}</span>
                              </>
                            ) : (
                              ts.title
                            )}
                          </div>
                          {isReference && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-all px-4 h-8"
                              onClick={() => addTopSectionAttachment(ts.id)}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Attachment
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        className="border p-0"
                        style={{ verticalAlign: "top" }}
                      >
                        <TranslatedQuillEditor
                          theme="bubble"
                          modules={quillModules}
                          value={ts.text || ""}
                          onChange={(content) => updateTopSection(ts.id, content)}
                          placeholder={`Isi bagian ${ts.title.split(" /")[0]} di sini...`}
                          className="wi-quill-editor w-full"
                          style={{ minHeight: '60px', ...cellStyle }}
                        />
                        
                        {isReference && (ts.attachments || []).length > 0 && (
                          <div className="border-t px-2 py-1 bg-slate-50/50">
                            {(ts.attachments || []).map((att, aIdx) => (
                              <div
                                key={att.id}
                                className="flex items-start border-b last:border-b-0 group/att"
                                style={{ borderColor: style.borderColor }}
                              >
                                <span className="shrink-0 font-semibold p-2" style={{ width: 30 }}>
                                  {aIdx + 1}.
                                </span>
                                <Popover 
                                  open={activeAttachmentId === att.id} 
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setActiveAttachmentId(att.id);
                                      setActiveAttachmentCategory("prosedur");
                                      handleAttachmentSearch(att.text, undefined, "prosedur");
                                    } else {
                                      setActiveAttachmentId(null);
                                    }
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <div className="flex-1 flex gap-2 w-full">
                                      <textarea
                                        className="flex-1 resize-y outline-none bg-transparent py-2 border border-transparent hover:border-slate-200 focus:border-slate-200 rounded px-1 transition-colors"
                                        style={{
                                          fontFamily: style.fontFamily,
                                          fontSize: style.fontSize,
                                          color: style.textColor,
                                          minHeight: 32,
                                        }}
                                        placeholder="Detail lampiran..."
                                        value={att.text}
                                        onChange={(e) => {
                                          updateTopSectionAttachment(ts.id, att.id, e.target.value, "");
                                          if (activeAttachmentId !== att.id) {
                                            setActiveAttachmentId(att.id);
                                            setActiveAttachmentCategory("prosedur");
                                          }
                                          handleAttachmentSearch(e.target.value, undefined, "prosedur");
                                        }}
                                        onClick={() => {
                                          if (activeAttachmentId !== att.id) {
                                            setActiveAttachmentId(att.id);
                                            setActiveAttachmentCategory("prosedur");
                                            handleAttachmentSearch(att.text, undefined, "prosedur");
                                          }
                                        }}
                                      />
                                      {att.code && (
                                        <div className="flex items-center justify-end px-2 py-2 w-[180px] whitespace-nowrap overflow-hidden text-right">
                                          <span className="text-blue-900 border border-blue-900/20 bg-blue-50 px-2 py-0.5 rounded text-[11px] max-w-full truncate" title={att.code}>
                                            {att.code}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[450px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    <div className="p-2 border-b flex items-center justify-between gap-2 bg-slate-50">
                                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Departemen:</span>
                                      <Select value={selectedDepartmentId} onValueChange={handleDepartmentChange}>
                                        <SelectTrigger className="h-7 text-xs bg-white w-full border-slate-200">
                                          <SelectValue placeholder="Pilih Departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">Semua Departemen</SelectItem>
                                          {departments.map(d => (
                                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Command shouldFilter={false}>
                                      <CommandList>
                                        <CommandEmpty className="py-6 text-center text-sm">
                                          {attachmentSearch ? `Tidak ada dokumen bernama "${attachmentSearch}"` : "Ketik untuk mencari dokumen..."}
                                        </CommandEmpty>
                                        {docOptions.length > 0 && (
                                          <CommandGroup heading="Pilih Dokumen (Opsional)">
                                            {docOptions.map(doc => (
                                              <CommandItem 
                                                key={doc.id} 
                                                value={doc.name} 
                                                onSelect={() => {
                                                  updateTopSectionAttachment(ts.id, att.id, doc.name, doc.documentCode);
                                                  setActiveAttachmentId(null);
                                                }}
                                              >
                                                <div className="flex flex-col">
                                                  <span className="font-medium text-sm">{doc.name}</span>
                                                  <span className="text-xs text-muted-foreground">{doc.documentCode}</span>
                                                </div>
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        )}
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <button
                                  className="shrink-0 text-red-400 p-2 opacity-0 group-hover/att:opacity-100 transition-opacity"
                                  onClick={() => removeTopSectionAttachment(ts.id, att.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>



          {/* ── Table Title Row (e.g., "5 Instruksi Kerja / Work Instruction") ── */}
          {true && (
            <table
              className="w-full border-collapse mt-[-1px] table-fixed"
              style={{ borderColor: style.borderColor }}
            >
              <tbody>
                <tr>
                  <td
                    style={{ ...headerBg, width: `${style.colWidths.no}%`, textAlign: "center" }}
                    className="border"
                  >
                    {topSections.length + 1}.
                  </td>
                  <td style={{ ...headerBg, width: `${100 - style.colWidths.no}%` }} className="border p-2">
                    Instruksi Kerja / <span className="text-blue-900 italic font-normal">Work Instruction</span>
                  </td>
                </tr>

              </tbody>
            </table>
          )}

          {/* Steps Table */}
          <table className="w-full border-collapse mt-[-1px] table-fixed">
            <thead>
              <tr>
                <th style={{ ...headerBg, width: `${style.colWidths.no}%`, textAlign: "center" }} className="border">
                  No
                </th>
                <th style={{ ...headerBg, width: `${style.colWidths.steps}%` }} className="border">
                  Langkah Kerja / <span className="text-blue-900 italic font-normal">Work Steps</span>
                </th>
                <th style={{ ...headerBg, width: `${style.colWidths.checkPoints}%` }} className="border">
                  Point Check / <span className="text-blue-900 italic font-normal">Check Points</span>
                </th>
                <th style={{ ...headerBg, width: `${style.colWidths.images}%` }} className="border">
                  Gambar Kerja / <span className="text-blue-900 italic font-normal">Working Pictures</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="border text-center text-gray-400 italic py-8 bg-slate-50/30"
                    style={cellStyle}
                  >
                    <div className="flex flex-row justify-center items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => addSection()}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Section
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => addSectionless()}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Row
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {sections.map((sec) => {
                const num = sectionNumbers.get(sec.id) || 1;
                return (
                  <React.Fragment key={sec.id}>
                    {/* Section Header */}
                    {!sec.isContinued && !sec.isSectionless && (
                      <tr data-section-id={sec.id}>
                        <td
                          style={{ ...headerBg, textAlign: "center" }}
                          className="border text-sm"
                        >
                          {num}
                        </td>
                        <td colSpan={3} style={headerBg} className="border p-0">
                          <div className="flex items-center">
                            <TranslatedQuillEditor
                              theme="bubble"
                              modules={quillModules}
                              className="flex-1 wi-quill-editor-section"
                              style={{ fontSize: style.fontSize, fontFamily: style.fontFamily }}
                              placeholder="Judul Section / Section Title"
                              value={sec.title || ""}
                              onChange={(content) =>
                                updateSectionTitle(sec.id, content)
                              }
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="shrink-0 text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => addStep(sec.id)}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Row
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="shrink-0 text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => addSectionAfter(sec.id)}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Section
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="shrink-0 h-7 w-7 text-red-500"
                              onClick={() => removeSection(sec.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Steps */}
                    {sec.steps.map((step, stIdx) => {
                      const stNum = stepNumbers.get(step.id) || (stIdx + 1);
                      return (
                      <tr key={step.id} className="group" data-section-id={sec.id} data-step-id={step.id}>
                        {/* Nomor */}
                        <td
                          style={{ ...cellStyle, textAlign: "center", verticalAlign: "top" }}
                          className="border font-semibold"
                        >
                          {sections.some(s => s.isSectionless) ? `${stNum}.` : `${num}.${stNum}.`}
                        </td>

                        {/* Langkah Kerja */}
                        <td
                          className="border p-0"
                          style={{ verticalAlign: "top" }}
                        >
                          <div style={{ ...cellStyle, minHeight: style.rowMinHeight }}>
                            <TranslatedQuillEditor
                              theme="bubble"
                              modules={quillModules}
                              value={step.stepText || ""}
                              onChange={(content) =>
                                updateStep(sec.id, step.id, "stepText", content)
                              }
                              placeholder="Tulis langkah kerja di sini..."
                              className="wi-quill-editor"
                            />
                          </div>
                        </td>

                        {/* Point Check */}
                        <td
                          className="border p-0"
                          style={{ verticalAlign: "top" }}
                        >
                          <div style={{ ...cellStyle, minHeight: style.rowMinHeight }}>
                            <TranslatedQuillEditor
                              theme="bubble"
                              modules={quillModules}
                              value={step.checkPointText || ""}
                              onChange={(content) =>
                                updateStep(sec.id, step.id, "checkPointText", content)
                              }
                              placeholder="-"
                              className="wi-quill-editor"
                            />
                          </div>
                        </td>

                        {/* Image */}
                        <td
                          className="border p-0"
                          style={{ verticalAlign: "top", textAlign: "center", position: "relative", height: "100%" }}
                        >
                          {uploadingImage === step.id ? (
                            <div
                              className="flex flex-col items-center justify-center p-2"
                              style={{ minHeight: style.rowMinHeight }}
                            >
                              <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
                              <span className="text-[10px] text-gray-500">
                                Uploading...
                              </span>
                            </div>
                          ) : (
                            <div 
                              className="flex flex-col items-center justify-start gap-2 w-full h-full outline-none transition-colors" 
                              style={{ minHeight: style.rowMinHeight }}
                              tabIndex={0}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('bg-slate-100');
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-slate-100');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-slate-100');
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                  const mockEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                                  handleImage(mockEvent, sec.id, step.id);
                                }
                              }}
                              onPaste={(e) => {
                                if (e.clipboardData.files && e.clipboardData.files.length > 0) {
                                  e.preventDefault();
                                  const mockEvent = { target: { files: e.clipboardData.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                                  handleImage(mockEvent, sec.id, step.id);
                                }
                              }}
                            >
                              {(step.images || (step.image ? [step.image] : [])).map((imgUrl, idx) => (
                                <div key={imgUrl} className="relative block w-full group/img">
                                  <img
                                    src={imgUrl}
                                    alt={`step-img-${idx}`}
                                    className="w-full h-auto object-contain border-b border-gray-200"
                                  />
                                  <button
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity shadow"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeImage(sec.id, step.id, idx);
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              
                              <label
                                className={`flex flex-col items-center justify-center cursor-pointer border-dashed border-gray-300 hover:border-primary hover:bg-slate-50 transition-colors w-full ${(step.images && step.images.length > 0) || step.image ? 'border-t min-h-[60px] bg-slate-50/50' : 'border-[1.5px] h-full min-h-[120px] flex-1'} outline-none`}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImage(e, sec.id, step.id)}
                                />
                                <div className="flex items-center gap-1">
                                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-[10px] text-gray-400 text-center px-2 mt-1">
                                  Click, Drop, or Paste Image
                                </span>
                              </label>
                            </div>
                          )}

                          {/* Row Actions */}
                          <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="flex items-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs transition-colors shadow-sm border border-blue-100"
                              title="Tambah baris di bawah (Insert Row Below)"
                              onClick={(e) => {
                                e.preventDefault();
                                addStepAfter(sec.id, step.id);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Row
                            </button>
                            <button
                              type="button"
                              className="flex items-center text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs transition-colors shadow-sm border border-red-100"
                              title="Hapus baris (Delete Row)"
                              onClick={(e) => {
                                e.preventDefault();
                                removeStep(sec.id, step.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Persistent Add Button at bottom of table */}
          {sections.length > 0 && (
            <div className="flex justify-center p-4 border border-t-0 bg-slate-50/30 mb-1" style={{ borderColor: style.borderColor }}>
              {sections.some(s => s.isSectionless) ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-dashed border-primary/50 text-primary hover:bg-primary/5"
                  onClick={() => addSectionless()}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Row
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-dashed border-primary/50 text-primary hover:bg-primary/5"
                  onClick={() => addSection()}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Section
                </Button>
              )}
            </div>
          )}

          {/* Attachments — Only show on the last page */}
          {true && (
            <table className="w-full border-collapse mt-[-1px] table-fixed" style={{ borderBottom: `${style.borderWidth}px solid ${style.borderColor}` }}>
              <tbody>
                <tr>
                  <td style={headerBg} className="border text-sm">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        Lampiran /{" "}
                        <span className="text-blue-900 italic font-normal">
                          Attachment
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-all px-4 h-8"
                        onClick={addAttachment}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Attachment
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border" style={{ ...cellStyle, padding: 0 }}>
                    {attachments.length === 0 && (
                      <p className="text-center text-gray-400 italic text-xs p-4">
                        Belum ada lampiran. Klik "+ Add Attachment".
                      </p>
                    )}
                    {attachments.map((att, aIdx) => (
                      <div
                        key={att.id}
                        className="flex items-start border-b last:border-b-0 group"
                        style={{ borderColor: style.borderColor }}
                      >
                        <span
                          className="shrink-0 font-semibold p-2"
                          style={{ width: 30 }}
                        >
                          {aIdx + 1}.
                        </span>
                        <Popover 
                          open={activeAttachmentId === att.id} 
                          onOpenChange={(open) => {
                            if (open) {
                              setActiveAttachmentId(att.id);
                              setActiveAttachmentCategory("form");
                              handleAttachmentSearch(att.text, undefined, "form");
                            } else {
                              setActiveAttachmentId(null);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <div className="flex-1 flex gap-2 w-full">
                              <textarea
                                className="flex-1 resize-y outline-none bg-transparent py-2 border border-transparent hover:border-slate-200 focus:border-slate-200 rounded px-1 transition-colors"
                                style={{
                                  fontFamily: style.fontFamily,
                                  fontSize: style.fontSize,
                                  color: style.textColor,
                                  minHeight: 32,
                                }}
                                placeholder="Detail lampiran..."
                                value={att.text}
                                onChange={(e) => {
                                  updateAttachment(att.id, e.target.value, "");
                                  if (activeAttachmentId !== att.id) {
                                    setActiveAttachmentId(att.id);
                                    setActiveAttachmentCategory("form");
                                  }
                                  handleAttachmentSearch(e.target.value, undefined, activeAttachmentCategory);
                                }}
                                onClick={() => {
                                  if (activeAttachmentId !== att.id) {
                                    setActiveAttachmentId(att.id);
                                    setActiveAttachmentCategory("form");
                                    handleAttachmentSearch(att.text, undefined, "form");
                                  }
                                }}
                              />
                              {att.code && (
                                <div className="flex items-center justify-end px-2 py-2 w-[180px] whitespace-nowrap overflow-hidden text-right">
                                  <span className="text-blue-900 border border-blue-900/20 bg-blue-50 px-2 py-0.5 rounded text-[11px] max-w-full truncate" title={att.code}>
                                    {att.code}
                                  </span>
                                </div>
                              )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[450px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                            {/* Filter: Departemen */}
                            <div className="p-2 border-b flex items-center justify-between gap-2 bg-slate-50">
                              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Departemen:</span>
                              <Select value={selectedDepartmentId} onValueChange={handleDepartmentChange}>
                                <SelectTrigger className="h-7 text-xs bg-white w-full border-slate-200">
                                  <SelectValue placeholder="Pilih Departemen" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Semua Departemen</SelectItem>
                                  {departments.map(d => (
                                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Filter: Category Dokumen (Form / Standar / IK) */}
                            <div className="p-2 border-b flex items-center justify-between gap-2 bg-slate-50">
                              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Kategori:</span>
                              <Select
                                value={activeAttachmentCategory}
                                onValueChange={(cat) => {
                                  setActiveAttachmentCategory(cat);
                                  handleAttachmentSearch(attachmentSearch, undefined, cat);
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs bg-white w-full border-slate-200">
                                  <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="form">Form</SelectItem>
                                  <SelectItem value="standard">Standar</SelectItem>
                                  <SelectItem value="instruksi_kerja">IK</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Command shouldFilter={false}>
                              <CommandList>
                                <CommandEmpty className="py-6 text-center text-sm">
                                  {attachmentSearch ? `Tidak ada dokumen bernama "${attachmentSearch}"` : "Ketik untuk mencari dokumen..."}
                                </CommandEmpty>
                                {docOptions.length > 0 && (
                                  <CommandGroup heading="Pilih Dokumen (Opsional)">
                                    {docOptions.map(doc => (
                                      <CommandItem 
                                        key={doc.id} 
                                        value={doc.name} 
                                        onSelect={() => {
                                          updateAttachment(att.id, doc.name, doc.documentCode);
                                          setActiveAttachmentId(null);
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium text-sm">{doc.name}</span>
                                          <span className="text-xs text-muted-foreground">{doc.documentCode}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <button
                          className="shrink-0 text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
