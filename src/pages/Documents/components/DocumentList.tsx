import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CardHeader,
  Card,
  CardContent,
} from "@/components/ui/card";
import { Pagination } from "@/services/api/types/documents.types";
import { Document } from "@/services/api/types/documents.types";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/common/Pagination";
import { Edit, Eye, FolderSync, Printer, Trash, BookOpen, ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow } from "lucide-react";
import Search from "@/components/common/Search";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import ViewIndexDialog from "../../Shared/components/ViewIndexDialog";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  asyncTogglePublishDocumentActionCreator,
  asyncDeleteDocumentActionCreator,
} from "@/store/documents/action";
import { asyncBulkRequestPrintActionCreator } from "@/store/printRequests/action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { getDepartments } from "@/services/api/departments";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Clock, XCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

function BedgeStatus({ status }: { status: string }) {
  let badgeText: string;
  let badgeColorClass: string;
  let dotClass: string;
  let glowClass: string;

  switch (status) {
    case "approved":
      badgeText = "Approved";
      badgeColorClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      dotClass = "bg-emerald-500";
      glowClass = "shadow-[0_0_6px_rgba(16,185,129,0.25)]";
      break;
    case "pending_approval":
      badgeText = "Pending";
      badgeColorClass = "bg-amber-50 text-amber-700 border-amber-200/60";
      dotClass = "bg-amber-500";
      glowClass = "shadow-[0_0_6px_rgba(245,158,11,0.25)]";
      break;
    case "rejected":
      badgeText = "Rejected";
      badgeColorClass = "bg-red-50 text-red-700 border-red-200/60";
      dotClass = "bg-red-500";
      glowClass = "shadow-[0_0_6px_rgba(239,68,68,0.25)]";
      break;
    case "draft":
      badgeText = "Draft";
      badgeColorClass = "bg-slate-50 text-slate-600 border-slate-200/60";
      dotClass = "bg-slate-400";
      glowClass = "shadow-[0_0_6px_rgba(148,163,184,0.15)]";
      break;
    default:
      badgeText = status;
      badgeColorClass = "bg-gray-50 text-gray-600 border-gray-200/60";
      dotClass = "bg-gray-400";
      glowClass = "shadow-[0_0_6px_rgba(156,163,175,0.15)]";
      break;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative group/badge"
    >
      <Badge
        className={`relative overflow-hidden inline-flex items-center gap-1.25 px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all duration-300 cursor-pointer ${badgeColorClass} ${glowClass} group-hover/badge:shadow-md`}
      >
        {/* Continuous Shimmer Sweep - More Intense */}
        <motion.div
          animate={{
            x: ["-150%", "150%"],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.5
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-20 pointer-events-none"
        />
        
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 relative ${dotClass}`}>
          {/* Enhanced Ping for all active states */}
          {(status === 'pending_approval' || status === 'approved') && (
            <motion.span 
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-inherit"
            ></motion.span>
          )}
        </span>
        <span className="relative z-10">{badgeText}</span>
      </Badge>
    </motion.div>
  );
}

export default function DocumentList({
  documents,
  status,
  destination,
  pagination,
  handlePageChange,
  handleLimitChange,
  handleSearchChange,
  handleStatusChange,
  handleDestinationChange,
  search,
}: {
  documents: Document[];
  status: string | null;
  destination?: string | null;
  pagination: Pagination;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusChange: (value: string) => void;
  handleDestinationChange?: (value: string) => void;
  search: string;
}) {
  const { t } = useLanguage();

  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  const handleTopScroll = () => {
    if (bottomScrollRef.current && topScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    // Keep top scroll div width synced with the actual table content width
    const bottomDiv = bottomScrollRef.current;
    const topDiv = topScrollRef.current;
    
    if (!bottomDiv || !topDiv) return;

    const topInnerDiv = topDiv.firstChild as HTMLDivElement;
    if (!topInnerDiv) return;

    const syncWidth = () => {
      if (!bottomDiv || !topInnerDiv) return;
      // Get the actual scrolled width of the table wrapper
      const width = bottomDiv.scrollWidth;
      
      // Only set if different, to avoid thrashing
      if (topInnerDiv.style.width !== `${width}px`) {
        topInnerDiv.style.width = `${width}px`;
      }
      
      // Sync scroll position if needed
      if (topDiv && topDiv.scrollLeft !== bottomDiv.scrollLeft) {
         topDiv.scrollLeft = bottomDiv.scrollLeft;
      }
    };

    syncWidth(); // initial sync

    // Observe changes to the bottom container's size and its children
    const resizeObserver = new ResizeObserver(() => {
      syncWidth();
    });

    resizeObserver.observe(bottomDiv);
    const tableEl = bottomDiv.querySelector("table");
    if (tableEl) {
      resizeObserver.observe(tableEl);
    }
    
    // Fallback interval to ensure width is synced after async data rendering
    const interval = setInterval(syncWidth, 500);

    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [documents]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.authUser?.user);
  const isQAUser = user?.departments?.some((dept: any) => {
    const deptName = typeof dept === 'string' ? dept : (dept?.departmentCode || dept?.department?.departmentCode || dept?.name || '');
    return deptName.toLowerCase().includes('qa') || deptName.toLowerCase().includes('quality assurance');
  });
  const departmentId = user?.departmentIds?.[0];
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [deleteReason, setDeleteReason] = useState("");
  
  const [allDepartments, setAllDepartments] = useState<{ id: number; name: string; departmentCode: string }[]>([]);

  useEffect(() => {
    if (isQAUser && allDepartments.length === 0) {
      getDepartments(1, 100)
        .then((res) => {
          setAllDepartments(res.departments);
        })
        .catch((err) => {
          console.error("Failed to fetch departments:", err);
        });
    }
  }, [isQAUser]);


  // Approval Progress Popup State
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressDoc, setProgressDoc] = useState<Document | null>(null);

  const handleShowProgress = (doc: Document) => {
    setProgressDoc(doc);
    setProgressModalOpen(true);
  };

  // Bulk print state
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
  const [bulkPrintModalOpen, setBulkPrintModalOpen] = useState(false);
  const [bulkPrintForm, setBulkPrintForm] = useState({
    reason: "",
    copies: 1,
    storageLocation: "",
    distribution: "Internal" as "Internal" | "External",
  });

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

  const toggleSort = () => {
    if (sortOrder === "none") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("none");
  };

  // When "Pending" is selected, fetch all from API and filter client-side
  // to show draft (0%), pending_approval, rejected — everything not yet fully approved
  const sortedDocuments = [...(documents || [])]
    .filter((doc: any) => {
      if (status === "pending_approval") return doc.status !== "approved";
      return true;
    })
    .sort((a: any, b: any) => {
    if (sortOrder === "none") return 0;
    
    const extractNumber = (code: string) => {
      if (!code) return 0;
      const match = code.match(/(\d+)(?!.*\d)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const numA = extractNumber(a.documentCode);
    const numB = extractNumber(b.documentCode);

    if (sortOrder === "asc") return numA - numB;
    return numB - numA;
  });

  const handlePublishToggle = (id: number, currentStatus: boolean) => {
    dispatch(asyncTogglePublishDocumentActionCreator(id, !currentStatus));
  };

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setDeleteReason("");
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDocument) {
      await dispatch(
        asyncDeleteDocumentActionCreator(selectedDocument.id, deleteReason)
      );
      setDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  // Checkbox handlers
  const handleSelectDocument = (documentId: number, checked: boolean) => {
    if (checked) {
      setSelectedDocumentIds((prev) => [...prev, documentId]);
    } else {
      setSelectedDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allDocIds = (documents || []).map((doc) => doc.id);
      setSelectedDocumentIds(allDocIds);
    } else {
      setSelectedDocumentIds([]);
    }
  };

  const allSelected =
    (documents || []).length > 0 &&
    (documents || []).every((doc) => selectedDocumentIds.includes(doc.id));

  // Derived state for bulk print (only approved documents)
  const selectedApprovedDocumentIds = (documents || [])
    .filter((doc) => selectedDocumentIds.includes(doc.id) && doc.status === "approved")
    .map((doc) => doc.id);

  // Bulk print handlers
  const handleBulkPrintClick = () => {
    setBulkPrintForm({
      reason: "",
      copies: 1,
      storageLocation: "",
      distribution: "Internal",
    });
    setBulkPrintModalOpen(true);
  };

  const handleBulkPrintConfirm = async () => {
    try {
      await dispatch(
        asyncBulkRequestPrintActionCreator({
          documentIds: selectedApprovedDocumentIds,
          reason: bulkPrintForm.reason,
          copies: bulkPrintForm.copies,
          storageLocation: bulkPrintForm.storageLocation,
          distribution: bulkPrintForm.distribution,
        })
      );
      setBulkPrintModalOpen(false);
      setSelectedDocumentIds([]);
    } catch (error) {
      // Error handled in action
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-muted/30 shadow-lg shadow-black/[0.03] overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-white to-gray-50/80 border-b border-gray-100/80 p-6 space-y-4">
          <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("documentList.title")}</h2>
              <p className="text-sm text-gray-500">{t("documentList.subtitle")}</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
            {/* Search Bar - Limited Width */}
            <div className="w-full md:w-1/3">
               <Search value={search} onChange={handleSearchChange} className="w-full" />
            </div>

            {/* Actions Group - Right Aligned */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
               {/* Filter Toggle - Only show if user is QA or has multiple departments */}
               {(isQAUser || user?.departments?.length > 1) && (
                 <div className="flex items-center gap-2 border-r pr-3 mr-1">
                   <Label htmlFor="destination-filter" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">{t("documentList.distribution")}</Label>
                   <Select
                     value={destination || "All"}
                     onValueChange={(val) => handleDestinationChange && handleDestinationChange(val)}
                   >
                     <SelectTrigger id="destination-filter" className="h-8 w-[140px] text-xs bg-white">
                       <SelectValue placeholder={t("documentList.allDest")} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="All">{t("documentList.allDest")}</SelectItem>
                       {isQAUser ? (
                         allDepartments.map((dept: any) => {
                           const deptName = dept.departmentCode || dept.name;
                           return (
                             <SelectItem key={dept.id} value={deptName}>{deptName}</SelectItem>
                           );
                         })
                       ) : (
                         user?.departments?.map((dept: string) => (
                           <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                         ))
                       )}
                     </SelectContent>
                   </Select>
                 </div>
               )}

               <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-gray-700 select-none whitespace-nowrap">Status:</Label>
                  <Select
                    value={status ?? "all"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white border-slate-200 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending_approval">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 
                 {departmentId && (
                    <ViewIndexDialog
                      departmentId={departmentId}
                      trigger={
                        <Button
                          variant="outline"
                          className="h-7 gap-1.5 border-primary/20 bg-primary/[0.02] text-primary hover:bg-primary hover:text-white rounded-full transition-all text-[10px] font-bold px-3 shadow-sm w-full justify-center"
                        >
                          <BookOpen className="h-3 w-3" />
                          {t("documentList.masterIndex")}
                        </Button>
                      }
                    />
                  )}

                  <Button
                    variant="ghost"
                    onClick={toggleSort}
                    className="h-7 gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg px-2 w-full justify-center"
                  >
                    {sortOrder === "none" && <ArrowUpDown className="h-3.5 w-3.5" />}
                    {sortOrder === "asc" && <ArrowUpNarrowWide className="h-3.5 w-3.5 text-primary" />}
                    {sortOrder === "desc" && <ArrowDownWideNarrow className="h-3.5 w-3.5 text-primary" />}
                    Sort by Document Number {sortOrder !== "none" && `(${sortOrder.toUpperCase()})`}
                  </Button>
               </div>

               {/* Bulk Action Buttons */}
               {selectedDocumentIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  {/* Bulk Print Button - Only for Approved documents */}
                  {selectedApprovedDocumentIds.length > 0 && (
                    <Button
                      onClick={handleBulkPrintClick}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm gap-2 h-9 px-4"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="font-medium">{t("documentList.bulkPrint")}</span>
                      <Badge variant="secondary" className="bg-purple-500 text-white border-0 px-1.5 h-5 min-w-[1.25rem]">
                        {selectedApprovedDocumentIds.length}
                      </Badge>
                    </Button>
                  )}


                </motion.div>
               )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-end py-5 px-6">
            <PaginationComponent
              limit={pagination?.limit}
              limitChange={handleLimitChange}
              currentPage={pagination?.page}
              totalPages={pagination?.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          
          {/* Dummy scrollbar at the top */}
          <div 
            ref={topScrollRef} 
            className="w-full overflow-x-scroll mb-2" 
            onScroll={handleTopScroll}
          >
            <div style={{ height: "1px" }}></div>
          </div>

          <Table containerProps={{ ref: bottomScrollRef, onScroll: handleBottomScroll }}>
            <TableHeader >
              <TableRow >
                {/* Checkbox Column Header */}
                <TableHead className="bg-primary text-primary-foreground rounded-tl-md w-12 pl-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    aria-label="Select all documents"
                    className="border-white"
                  />
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.name")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.noDocument")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.revision")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.releaseDate")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.status")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.approvalProgress")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.documentType")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("documentList.columns.published")}
                </TableHead>

                <TableHead className="bg-primary text-primary-foreground rounded-tr-md sticky right-0 z-20">
                  {t("documentList.columns.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-1 border-muted">
              {!documents || documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-[400px] text-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/5 rounded-full w-full h-full"
                    >
                      <div className="bg-muted/20 p-6 rounded-full mb-4 ring-8 ring-muted/10">
                        <Info className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{t("documentList.noDocuments")}</h3>
                      <p className="max-w-xs text-sm text-muted-foreground/80 leading-relaxed">
                        {t("documentList.noDocumentsDesc")}
                      </p>
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedDocuments.map((document, index) => (
                <motion.tr
                  key={document.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 transition-colors duration-200 border-b border-muted/50 last:border-0"
                >
                  {/* Checkbox Column */}
                  <TableCell className="w-12 pl-3 py-3">
                    <Checkbox
                      checked={selectedDocumentIds.includes(document.id)}
                      onCheckedChange={(checked) =>
                        handleSelectDocument(document.id, checked as boolean)
                      }
                      aria-label={`Select ${document.name}`}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
                    />
                  </TableCell>
                  <TableCell className="py-3 font-medium text-foreground/90">
                    <div className="flex flex-col">
                      <span className="group-hover:text-primary transition-colors min-w-[250px] max-w-[250px] md:max-w-[300px] lg:max-w-[400px] whitespace-normal break-words">{document.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold md:hidden">{document.documentCode}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground bg-muted/20 rounded-md px-2 w-fit mx-auto my-1 md:table-cell hidden group-hover:bg-muted/40 transition-colors">
                    {document.documentCode || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/5 text-primary text-xs font-bold border border-primary/10">
                      {document.revision}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {new Date(document.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="py-3">
                    <BedgeStatus status={document.status} />
                  </TableCell>
                  <TableCell className="py-3">
                    <motion.div 
                      className="flex flex-col gap-1 w-32 cursor-pointer group/progress p-0.5 rounded-lg hover:bg-primary/[0.02] transition-colors" 
                      onClick={() => handleShowProgress(document)}
                      whileHover={{ scale: 1.02, x: 2 }}
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-muted-foreground group-hover/progress:text-primary transition-colors font-bold uppercase tracking-wider">{t("documentList.progress")}</span>
                        <motion.span 
                          animate={{ 
                            opacity: [1, 0.4, 1],
                            scale: (document.approvalProgress?.percentage || 0) < 100 ? [1, 1.05, 1] : 1
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="font-black text-primary tabular-nums"
                        >
                          {document.approvalProgress?.percentage || 0}%
                        </motion.span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200 shadow-inner relative group-hover/progress:shadow-md transition-shadow">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${document.approvalProgress?.percentage || 0}%` }}
                          transition={{ duration: 1.2, ease: "circOut" }}
                          className={`h-full relative overflow-hidden ${
                            (document.approvalProgress?.percentage || 0) === 100 
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                        >
                          {/* Liquid Flow Animation - Dual Shimmer */}
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[45deg]"
                          />
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "linear",
                              delay: 0.5
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg]"
                          />

                          {/* Glowing Lead Indicator - More Intense */}
                          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/60 blur-[3px] shadow-[0_0_12px_white] z-10" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold border-none ${
                       document.isInternal ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {document.isInternal === true ? "Internal" : "External"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    {document.status === "approved" ? (
                      <div
                        onClick={() =>
                          handlePublishToggle(document.id, document.isPublished)
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border cursor-pointer hover:scale-105 active:scale-95 ${
                          document.isPublished
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${document.isPublished ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                        {document.isPublished ? t("documentList.publishedState") : t("documentList.unpublishedState")}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest pl-2">---</span>
                    )}
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur-sm border-l border-border/50 py-3 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-1 items-center justify-end pr-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() =>
                          navigate(`/documents/detail/${document.id}`)
                        }
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                        title={t("documentList.viewDocument")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {document.status === "draft" || document.status === "rejected" ? (
                        <Button
                          onClick={() =>
                            navigate(`/documents/update/${document.id}`)
                          }
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                          title={t("documentList.editUsage")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      ) : document.status === "approved" ? (
                        <Button
                          onClick={() =>
                            navigate(`/documents/revise/${document.id}`)
                          }
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 transition-all rounded-lg"
                          title={t("documentList.reviseDocument")}
                        >
                          <FolderSync className="w-4 h-4" />
                        </Button>
                      ) : null}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                        title={t("documentList.deleteDocument")}
                        onClick={() => handleDeleteClick(document)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-end py-5">
        <PaginationComponent
          limit={pagination?.limit}
          limitChange={handleLimitChange}
          currentPage={pagination?.page}
          totalPages={pagination?.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("documentList.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("documentList.deleteConfirm")}
              { (selectedDocument?.status === "approved" || (selectedDocument?.revision ?? 0) > 0) &&
                t("documentList.deleteApprovedDesc")}
              { selectedDocument?.status !== "approved" && (selectedDocument?.revision ?? 0) === 0 &&
                t("documentList.deleteUndoneDesc")}
            </DialogDescription>
          </DialogHeader>

          {(selectedDocument?.status === "approved" || (selectedDocument?.revision ?? 0) > 0) && (
            <div className="space-y-2 py-2">
              <Label htmlFor="reason">{t("documentList.reasonForDeletion")}</Label>
              <Textarea
                id="reason"
                placeholder={t("documentList.reasonPlaceholder")}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="min-h-[100px] w-full break-words whitespace-pre-wrap break-all"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={
                (selectedDocument?.status === "approved" || (selectedDocument?.revision ?? 0) > 0) && !deleteReason.trim()
              }
            >
              {(selectedDocument?.status === "approved" || (selectedDocument?.revision ?? 0) > 0)
                ? t("documentList.requestDeletion")
                : t("documentList.deleteDocument")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Print Modal */}
      <Dialog open={bulkPrintModalOpen} onOpenChange={setBulkPrintModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-purple-600" />
              {t("documentList.bulkPrintTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("documentList.bulkPrintDesc", { count: selectedDocumentIds.length })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-reason">{t("documentList.reasonForPrint")}</Label>
              <Textarea
                id="bulk-reason"
                placeholder={t("documentList.reasonPrintPlaceholder")}
                value={bulkPrintForm.reason}
                onChange={(e) =>
                  setBulkPrintForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-copies">{t("documentList.numberOfCopies")}</Label>
                <Input
                  id="bulk-copies"
                  type="number"
                  min={1}
                  value={bulkPrintForm.copies}
                  onChange={(e) =>
                    setBulkPrintForm((prev) => ({
                      ...prev,
                      copies: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-distribution">{t("documentList.distributionLabel")}</Label>
                <Select
                  value={bulkPrintForm.distribution}
                  onValueChange={(value: "Internal" | "External") =>
                    setBulkPrintForm((prev) => ({ ...prev, distribution: value }))
                  }
                >
                  <SelectTrigger id="bulk-distribution">
                    <SelectValue placeholder="Select distribution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-storage">{t("documentList.storageLocation")}</Label>
              <Input
                id="bulk-storage"
                placeholder={t("documentList.storagePlaceholder")}
                value={bulkPrintForm.storageLocation}
                onChange={(e) =>
                  setBulkPrintForm((prev) => ({
                    ...prev,
                    storageLocation: e.target.value,
                  }))
                }
              />
            </div>

            {/* Selected Documents Preview */}
            <div className="space-y-2">
              <Label>{t("documentList.selectedDocuments")}</Label>
              <div className="max-h-32 overflow-y-auto rounded-md border p-2 bg-gray-50">
                {(documents || [])
                  .filter((doc) => selectedApprovedDocumentIds.includes(doc.id))
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="text-sm py-1 border-b last:border-0 flex justify-between"
                    >
                      <span className="font-medium truncate">{doc.name}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {doc.documentCode}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkPrintModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleBulkPrintConfirm}
              disabled={!bulkPrintForm.reason.trim() || !bulkPrintForm.storageLocation.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              {t("documentList.requestPrint")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approval Progress Modal */}
      <Dialog open={progressModalOpen} onOpenChange={setProgressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Info className="w-5 h-5 text-primary" />
              {t("documentList.approvalWorkflow")}
            </DialogTitle>
            <DialogDescription>
              {t("documentList.currentProgressFor")} <span className="font-semibold text-primary">{progressDoc?.documentCode}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 overflow-y-auto max-h-[60vh]">
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-gray-200 before:to-gray-100/50">
              {progressDoc?.approvalProgress?.steps.map((step) => (
                <div key={step.id} className="relative flex items-center justify-between pl-12 group">
                  <div className="absolute left-0 flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-muted group-hover:border-primary transition-all duration-300 z-10 shadow-sm">
                    {step.status === 'approved' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-50" />
                    ) : step.status === 'rejected' ? (
                      <XCircle className="w-6 h-6 text-red-500 fill-red-50" />
                    ) : step.status === 'waiting' ? (
                      <Clock className="w-6 h-6 text-slate-400 fill-slate-50" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-500 fill-yellow-50 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-xl border border-muted shadow-sm group-hover:border-primary group-hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-gray-800">{step.title}</h4>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 py-0 ${
                        step.status === 'approved' ? 'text-green-600 bg-green-100 border-green-200' : 
                        step.status === 'rejected' ? 'text-red-600 bg-red-100 border-red-200' : 
                        step.status === 'waiting' ? 'text-slate-500 bg-slate-100 border-slate-200' :
                        'text-yellow-600 bg-yellow-100 border-yellow-200'
                      }`}>
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 italic">Approver: <span className="text-gray-700 font-medium not-italic">{step.approverName}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setProgressModalOpen(false)}>
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </motion.div>
  );
}
