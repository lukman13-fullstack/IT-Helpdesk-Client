import Layout from "@/components/layout/layout";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState, useRef } from "react";
import { asyncGetApprovalRequestsActionCreator, asyncApproveBatchDocumentsActionCreator } from "@/store/approvals/action";
import { getDepartments } from "@/services/api/departments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Date formatting handled inline
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Eye, X, CheckCircle2, Loader2, ClipboardX, FileDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ApproveDialog from "./components/approve-dialog";
import RejectDialog from "./components/reject-dialog";
import BatchApprovalModal from "./components/BatchApprovalModal";
import ExportApprovalsModal from "./components/ExportApprovalsModal";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import PaginationComponent from "@/components/common/Pagination";

type ApprovalType = "all" | "document" | "print" | "deletion" | "reference";
type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function UnifiedApprovals() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { approvalRequests, loading } = useAppSelector(
    (state) => state.approvals
  );
  const { user } = useAppSelector((state) => state.authUser);
  const isSuperAdmin = user?.role?.name === "Super Admin" || user?.role?.name === "SUPER_ADMIN";
  
  const isQA = user?.departments?.some((dept: any) => {
    const deptName = typeof dept === 'string' ? dept : dept.name || '';
    return deptName.toLowerCase().includes('qa') || deptName.toLowerCase().includes('quality assurance');
  }) || false;
  
  const isQASuperAdmin = isSuperAdmin && isQA;

  const [activeTab, setActiveTab] = useState<ApprovalType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Super admin filters
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, departmentFilter, startDate, endDate]);

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

  // Dialog states
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [batchApproving, setBatchApproving] = useState(false);

  // Batch Approval Modal from Email Magic Link
  const [searchParams] = useSearchParams();
  const rawBatchId = searchParams.get("batchId");
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(!!rawBatchId);

  useEffect(() => {
    // Fetch all approvals without status filter to show complete history
    dispatch(asyncGetApprovalRequestsActionCreator());
    if (isSuperAdmin) {
      getDepartments(1, 100).then(res => setDepartments(res.departments)).catch(console.error);
    }
  }, [dispatch, isSuperAdmin]);

  // Helper function to determine approval type
  const getApprovalType = (approval: any): string => {
    // Check if it's a reference check
    if (approval.isReferenceCheck) return "reference";

    // Check approval type field directly
    if (approval.type === "deletion") return "deletion";
    if (approval.type === "print" || approval.printRequestId) return "print";
    if (approval.type === "revision") return "revision"; // Direct type check

    // type = "approval" means New Document (regardless of document's current revision)
    // Each approval record has its own documentRevision that tracks WHEN this approval was created
    return "document";
  };

  // Helper function to get approval type badge
  const getTypeBadge = (approval: any, type: string) => {
    // Use approval's documentRevision field, not document.revision
    const revisionNumber = approval.documentRevision ?? approval.document?.revision ?? 0;
    const revisionLabel = String(revisionNumber).padStart(2, '0');

    const badges = {
      document: { label: t("approvals.badges.newDoc"), class: "bg-blue-100 text-blue-800" },
      print: { label: t("approvals.badges.print"), class: "bg-purple-100 text-purple-800" },
      deletion: { label: t("approvals.badges.delete"), class: "bg-orange-100 text-orange-800" },
      reference: {
        label: revisionNumber > 0 ? `${t("approvals.badges.refRev")} ${revisionLabel}` : t("approvals.badges.reference"),
        class: "bg-green-100 text-green-800",
      },
      revision: {
        label: `${t("approvals.badges.rev")} ${revisionLabel}`, // e.g., "Rev 01", "Rev 02"
        class: "bg-cyan-100 text-cyan-800",
      },
    };
    const badge = badges[type as keyof typeof badges] || badges.document;
    return (
      <Badge className={badge.class} variant="outline">
        {badge.label}
      </Badge>
    );
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: t("approvals.pending"), class: "bg-yellow-100 text-yellow-800" },
      approved: { label: t("approvals.approved"), class: "bg-green-100 text-green-800" },
      rejected: { label: t("approvals.rejected"), class: "bg-red-100 text-red-800" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <Badge className={badge.class}>{badge.label}</Badge>;
  };

  // Filter approvals by type and status
  const filteredApprovals = approvalRequests.filter((approval: any) => {
    const type = getApprovalType(approval);
    
    // Hide print approvals if the user is not a QA Super Admin
    if (type === "print" && !isQASuperAdmin) {
      return false;
    }

    const typeMatch = activeTab === "all" || type === activeTab || (activeTab === "document" && type === "revision");
    const statusMatch =
      statusFilter === "all" || (approval.status || "").toLowerCase() === statusFilter;
      
    let deptMatch = true;
    if (isSuperAdmin && departmentFilter !== "all") {
      const approvalDeptId = approval.document?.department?.id || approval.document?.departmentId;
      deptMatch = String(approvalDeptId) === departmentFilter;
    }
    
    let dateMatch = true;
    if (isSuperAdmin && (startDate || endDate)) {
      const d = new Date(approval.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (d < start) dateMatch = false;
      }
      if (endDate && dateMatch) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) dateMatch = false;
      }
    }

    return typeMatch && statusMatch && deptMatch && dateMatch;
  }).sort((a: any, b: any) => {
    // Sort by status: pending and rejected first, then approved
    const getStatusWeight = (status: string) => {
      const normalizedStatus = (status || "").toLowerCase();
      if (normalizedStatus === "pending") return 1;
      if (normalizedStatus === "rejected") return 2;
      return 3; // "approved" and others
    };
    
    const weightDiff = getStatusWeight(a.status) - getStatusWeight(b.status);
    if (weightDiff !== 0) return weightDiff;
    
    // Secondary sort: by createdAt descending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalItems = filteredApprovals.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const pendingDocuments = filteredApprovals.filter((a: any) => (a.status || "").toLowerCase() === "pending" && (getApprovalType(a) === "document" || getApprovalType(a) === "revision"));
  const canBatchApprove = activeTab === "document" && statusFilter === "pending" && pendingDocuments.length > 0;

  const handleBatchApprove = async () => {
    if (!confirm(`Are you sure you want to approve ${pendingDocuments.length} pending documents?`)) return;
    setBatchApproving(true);
    const ids = pendingDocuments.map((a: any) => a.id);
    await dispatch(asyncApproveBatchDocumentsActionCreator(ids));
    setBatchApproving(false);
  };

  const handleApprove = (approval: any) => {
    setSelectedApproval(approval);
    setOpenApproveDialog(true);
  };

  const handleReject = (approval: any) => {
    setSelectedApproval(approval);
    setOpenRejectDialog(true);
  };

  const handleSuccess = () => {
    dispatch(asyncGetApprovalRequestsActionCreator({ silent: true }));
  };

  useEffect(() => {
    const bottomDiv = bottomScrollRef.current;
    const topDiv = topScrollRef.current;
    
    if (!bottomDiv || !topDiv) return;

    const topInnerDiv = topDiv.firstChild as HTMLDivElement;
    if (!topInnerDiv) return;

    const syncWidth = () => {
      if (!bottomDiv || !topInnerDiv) return;
      const width = bottomDiv.scrollWidth;
      if (topInnerDiv.style.width !== `${width}px`) {
        topInnerDiv.style.width = `${width}px`;
      }
      if (topDiv && topDiv.scrollLeft !== bottomDiv.scrollLeft) {
         topDiv.scrollLeft = bottomDiv.scrollLeft;
      }
    };

    syncWidth();
    const interval = setInterval(syncWidth, 500);
    const resizeObserver = new ResizeObserver(() => syncWidth());
    resizeObserver.observe(bottomDiv);
    const tableEl = bottomDiv.querySelector("table");
    if (tableEl) resizeObserver.observe(tableEl);

    return () => {
      clearInterval(interval);
      resizeObserver.disconnect();
    };
  }, [paginatedApprovals, activeTab]);

  return (
    <Layout
      title={t("sidebar.approvals")}
      items={[
        { label: t("common.home"), href: "/" },
        { label: t("sidebar.approvals"), href: "/approvals" },
      ]}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t("approvals.management")}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isSuperAdmin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter Advanced
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none text-sm text-slate-700">Date Range</h4>
                        <div className="flex items-center gap-2 bg-transparent rounded-md border border-input shadow-sm h-10 px-3">
                          <input 
                            type="date" 
                            className="text-sm bg-transparent border-none outline-none focus:ring-0 text-slate-700 cursor-pointer h-full w-full"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            title="From Date"
                          />
                          <span className="text-slate-300 text-sm">-</span>
                          <input 
                            type="date" 
                            className="text-sm bg-transparent border-none outline-none focus:ring-0 text-slate-700 cursor-pointer h-full w-full"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            title="To Date"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none text-sm text-slate-700">Department</h4>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="w-full h-10 bg-white">
                            <SelectValue placeholder="Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Depts</SelectItem>
                            {departments.map((d: any) => (
                              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {canBatchApprove && (
                <Button 
                  variant="default" 
                  onClick={handleBatchApprove} 
                  disabled={batchApproving || loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {batchApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {t("approvals.approveAllPending", { count: pendingDocuments.length.toString() })}
                </Button>
              )}
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("approvals.allStatus")}</SelectItem>
                  <SelectItem value="pending">{t("approvals.pending")}</SelectItem>
                  <SelectItem value="approved">{t("approvals.approved")}</SelectItem>
                  <SelectItem value="rejected">{t("approvals.rejected")}</SelectItem>
                </SelectContent>
              </Select>
              {isSuperAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setOpenExportModal(true)}
                  className="hidden md:flex bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {t("approvals.export.button") || "Export Excel"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ApprovalType)}
          >
            <TabsList className={`grid w-full ${isQASuperAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="all">{t("approvals.tabs.all")}</TabsTrigger>
              <TabsTrigger value="document">{t("approvals.tabs.document")}</TabsTrigger>
              {isQASuperAdmin && <TabsTrigger value="print">{t("approvals.tabs.print")}</TabsTrigger>}
              <TabsTrigger value="deletion">{t("approvals.tabs.deletion")}</TabsTrigger>
              <TabsTrigger value="reference">{t("approvals.tabs.reference")}</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {loading && filteredApprovals.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex justify-end pb-4 pt-2">
                    <PaginationComponent
                      limit={limit}
                      limitChange={(newLimit) => {
                        setLimit(newLimit);
                        setCurrentPage(1);
                      }}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
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
                    <TableHeader>
                    <TableRow>
                      <TableHead>{t("approvals.columns.type")}</TableHead>
                      <TableHead>{t("approvals.columns.documentCode")}</TableHead>
                      <TableHead>{t("approvals.columns.documentName")}</TableHead>
                      <TableHead>{t("approvals.columns.requester")}</TableHead>
                      <TableHead>{t("approvals.columns.status")}</TableHead>
                      <TableHead>{t("approvals.columns.reasonPurpose")}</TableHead>
                      <TableHead>{t("approvals.columns.requested")}</TableHead>
                      {isSuperAdmin && (
                        <>
                          <TableHead>{t("approvals.columns.approveDate")}</TableHead>
                          <TableHead>{t("approvals.columns.category")}</TableHead>
                          <TableHead>{t("approvals.columns.department")}</TableHead>
                        </>
                      )}
                      <TableHead className="text-right">{t("approvals.columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isSuperAdmin ? 11 : 8} className="h-[400px] text-center">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/5 rounded-full w-full h-full"
                          >
                            <div className="bg-muted/20 p-6 rounded-full mb-4 ring-8 ring-muted/10">
                              <ClipboardX className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{t("approvals.noApprovalsFound")}</h3>
                            <p className="max-w-xs text-sm text-muted-foreground/80 leading-relaxed">
                              {t("approvals.noApprovalsDesc")}
                            </p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedApprovals.map((approval: any, index: number) => {
                        const type = getApprovalType(approval);
                        return (
                          <motion.tr 
                            key={approval.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-muted/30 transition-colors duration-200 border-b border-muted/50 last:border-0"
                          >
                            <TableCell className="py-4">
                              {getTypeBadge(approval, type)}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground bg-muted/20 rounded-md px-2 py-1 w-fit mx-auto md:mx-0">
                              {approval.document?.documentCode || "-"}
                            </TableCell>
                            <TableCell className="font-medium text-foreground/90 py-4 min-w-[250px] max-w-[250px] md:max-w-[300px] lg:max-w-[400px] whitespace-normal break-words">
                              {approval.document?.name || "-"}
                            </TableCell>
                            <TableCell className="py-4 text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {(type === "print"
                                  ? approval.printRequest?.requester?.fullName
                                  : approval.creator?.fullName)?.[0] || "?"}
                                </div>
                                <span className="text-sm font-medium">
                                  {type === "print"
                                    ? approval.printRequest?.requester
                                        ?.fullName ||
                                      approval.creator?.fullName ||
                                      "-"
                                    : approval.creator?.fullName || "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {getStatusBadge(approval.status)}
                            </TableCell>
                            <TableCell className="max-w-xs py-4">
                              {/* Show reason/purpose based on approval type */}
                              {(() => {
                                let reasonText = "-";

                                if (
                                  type === "deletion" ||
                                  type === "revision"
                                ) {
                                  // Deletion/Revision: show approval.reason
                                  reasonText = approval.reason || "-";
                                } else if (type === "print") {
                                  // Print: show printRequest.reason
                                  reasonText =
                                    approval.printRequest?.reason || "-";
                                } else {
                                  // New Document: show proposalObjective
                                  reasonText =
                                    approval.document?.proposalObjective || "-";
                                }

                                return (
                                  <div className="bg-muted/20 p-2 rounded-md border border-muted/30">
                                    <span
                                      className="text-xs text-muted-foreground line-clamp-2"
                                      title={reasonText}
                                    >
                                      {reasonText}
                                    </span>
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground py-4">
                              {new Date(approval.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                              <div className="text-[10px] opacity-70">
                                {new Date(approval.createdAt).toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </TableCell>
                            {isSuperAdmin && (
                              <>
                                <TableCell className="text-sm py-4 text-muted-foreground">
                                  {approval.status === "approved" && approval.approvedAt ? (
                                    <>
                                      {new Date(approval.approvedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                      <div className="text-[10px] opacity-70">
                                        {new Date(approval.approvedAt).toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                    </>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="text-sm py-4">
                                  {approval.document?.category ? (
                                    <Badge variant="outline" className="capitalize">
                                      {approval.document.category.replace(/_/g, ' ')}
                                    </Badge>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="text-sm py-4 text-muted-foreground">
                                  {approval.document?.department?.name || "-"}
                                </TableCell>
                              </>
                            )}
                            <TableCell className="py-4">
                              <div className="flex gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate(`/approvals/${type}/${approval.id}`)
                                }
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title={t("approvals.viewDetails")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {approval.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                    onClick={() => handleApprove(approval)}
                                    title={t("approvals.approve")}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    onClick={() => handleReject(approval)}
                                    title={t("approvals.reject")}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-end pt-4 pb-2">
                  <PaginationComponent
                    limit={limit}
                    limitChange={(newLimit) => {
                      setLimit(newLimit);
                      setCurrentPage(1);
                    }}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </motion.div>

      {selectedApproval && (
        <>
          <ApproveDialog
            open={openApproveDialog}
            onOpenChange={setOpenApproveDialog}
            approvalId={selectedApproval.id}
            isPrintRequest={selectedApproval.isPrintRequest || false}
            isReferenceCheck={selectedApproval.isReferenceCheck || false}
            originalId={selectedApproval.originalId}
            onSuccess={handleSuccess}
          />
          <RejectDialog
            open={openRejectDialog}
            onOpenChange={setOpenRejectDialog}
            approvalId={selectedApproval.id}
            isPrintRequest={selectedApproval.isPrintRequest || false}
            isReferenceCheck={selectedApproval.isReferenceCheck || false}
            originalId={selectedApproval.originalId}
            onSuccess={handleSuccess}
          />
        </>
      )}

      {/* Batch Approval Modal */}
      <BatchApprovalModal
        isOpen={isBatchModalOpen}
        onOpenChange={setIsBatchModalOpen}
        batchId={rawBatchId}
        pendingApprovals={approvalRequests}
        onSuccess={handleSuccess}
      />

      {isSuperAdmin && (
        <ExportApprovalsModal
          open={openExportModal}
          onOpenChange={setOpenExportModal}
          approvals={approvalRequests}
        />
      )}
    </Layout>
  );
}
