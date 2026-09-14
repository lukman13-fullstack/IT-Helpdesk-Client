import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/services/api/types/documents.types";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/common/Pagination";
import { Eye, Loader2, UserCheck, PackageCheck, Printer, Download } from "lucide-react";
import Search from "@/components/common/Search";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { notify } from "@/lib/toast";
import { markAsReady, markAsTaken, downloadPrintFile, markAsPrinted } from "@/services/api/documents";
import { useState, useMemo, useRef, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetAllPrintHistoryActionCreator } from "@/store/printRequests/action";
import { useLanguage } from "@/context/LanguageContext";
import { exportPrintHistoryToExcel } from "@/lib/exportPrintHistoryToExcel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupedRequest {
  key: string;
  internal: any | null;
  external: any | null;
  document: any;
  requester: any;
  latestDate: string;
}

export default function PrintHistoryList({
  requests = [],
  pagination = { page: 1, limit: 100, total: 0, totalPages: 0 },
  handlePageChange,
  handleLimitChange,
  handleSearchChange,
  search,
  status,
  distribution,
  onFilterChange,
  loading,
}: {
  requests: any[];
  pagination: Pagination;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  status?: string;
  distribution?: string;
  onFilterChange?: (key: string, value: string) => void;
  loading: boolean;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authUser);
  const isSuperAdmin = user?.role?.name === "Super Admin" || user?.role?.name === "SUPER_ADMIN";
  const [downloadingItems, setDownloadingItems] = useState<{[key: number]: boolean}>({});
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
    if (tableEl) {
      resizeObserver.observe(tableEl);
    }

    return () => {
      clearInterval(interval);
      resizeObserver.disconnect();
    };
  }, [requests]);

  // Helper functions for group actions
  const canPrint = (req: any) => req && ["approved", "printed", "ready", "completed"].includes(req.status);
  const canMarkReady = (req: any) => req && ["approved", "printed"].includes(req.status);
  const canRecordPickup = (req: any) => req && req.status === "ready";

  // Group requests by documentId + requesterId into single rows
  const groupedRequests = useMemo(() => {
    const groups = new Map<string, GroupedRequest>();

    requests.forEach((request: any) => {
      const key = `${request.documentId}-${request.requesterId}`;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          key,
          internal: request.isInternal ? request : null,
          external: !request.isInternal ? request : null,
          document: request.document,
          requester: request.requester,
          latestDate: request.createdAt,
        });
      } else {
        if (request.isInternal && !existing.internal) {
          existing.internal = request;
        } else if (!request.isInternal && !existing.external) {
          existing.external = request;
        }
        if (new Date(request.createdAt) > new Date(existing.latestDate)) {
          existing.latestDate = request.createdAt;
        }
      }
    });

    return Array.from(groups.values());
  }, [requests]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: t("printHistory.status.pending"), className: "bg-yellow-100 text-yellow-800" },
      approved: { label: t("printHistory.status.approved"), className: "bg-blue-100 text-blue-800" },
      rejected: { label: t("printHistory.status.rejected"), className: "bg-red-100 text-red-800" },
      printed: { label: t("printHistory.status.printed"), className: "bg-purple-100 text-purple-800" },
      ready: { label: t("printHistory.status.ready"), className: "bg-cyan-100 text-cyan-800" },
      completed: { label: t("printHistory.status.completed"), className: "bg-green-100 text-green-800" },
    };

    const config = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getGroupStatusBadges = (group: GroupedRequest) => {
    const badges: React.ReactNode[] = [];
    if (group.internal) {
      badges.push(
        <div key="int" className="flex items-center gap-1">
          <span className="text-[10px] text-blue-600 font-bold">INT:</span>
          {getStatusBadge(group.internal.status)}
        </div>
      );
    }
    if (group.external) {
      badges.push(
        <div key="ext" className="flex items-center gap-1">
          <span className="text-[10px] text-orange-600 font-bold">EXT:</span>
          {getStatusBadge(group.external.status)}
        </div>
      );
    }
    return <div className="flex flex-col gap-1">{badges}</div>;
  };

  const refreshList = () => {
    dispatch(
      asyncGetAllPrintHistoryActionCreator({
        search,
        page: pagination?.page || 1,
        limit: pagination?.limit || 100,
      })
    );
  };

  const handleMarkAsReady = async (documentId: number, printRequestId: number) => {
    try {
      await markAsReady(documentId, printRequestId);
      notify.success("Document marked as ready and requester notified.");
      refreshList();
    } catch (error: any) {
      notify.error(error.message || "Failed to mark as ready");
    }
  };

  const handleMarkAsTaken = async (documentId: number, printRequestId: number) => {
    const picName = prompt("Enter PIC Name who took the document:");
    if (!picName) return;

    try {
      await markAsTaken(documentId, printRequestId, { picTaken: picName });
      notify.success("Document pickup recorded successfully.");
      refreshList();
    } catch (error: any) {
      notify.error(error.message || "Failed to record pickup");
    }
  };

  const handlePrintDocument = async (request: any) => {
    if (!request || !request.documentId) return;

    try {
      setDownloadingItems(prev => ({ ...prev, [request.id]: true }));

      const { blob, filename } = await downloadPrintFile(
        request.documentId,
        request.document?.name || "document",
        request.isInternal ? "controlled" : "uncontrolled",
        request.id
      );

      await markAsPrinted(request.documentId, request.id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      refreshList();

      notify.success(
        `${request.isInternal ? "Controlled" : "Uncontrolled"} document downloaded and marked as printed`
      );
    } catch (error: any) {
      console.error("Print failed:", error);
      notify.error(error.message || "Failed to print document");
    } finally {
      setDownloadingItems(prev => ({ ...prev, [request.id]: false }));
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportPrintHistoryToExcel(requests, t);
      notify.success("Exported successfully");
    } catch (error) {
      console.error(error);
      notify.error("Failed to export Excel");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
          <Search 
            value={search} 
            onChange={handleSearchChange} 
            className="w-full sm:w-[250px] lg:w-[350px]" 
          />
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={status || "all"}
              onValueChange={(value) => onFilterChange?.("status", value)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">{t("printHistory.status.pending")}</SelectItem>
                <SelectItem value="approved">{t("printHistory.status.approved")}</SelectItem>
                <SelectItem value="printed">{t("printHistory.status.printed")}</SelectItem>
                <SelectItem value="ready">{t("printHistory.status.ready")}</SelectItem>
                <SelectItem value="completed">{t("printHistory.status.completed")}</SelectItem>
                <SelectItem value="rejected">{t("printHistory.status.rejected")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={distribution || "all"}
              onValueChange={(value) => onFilterChange?.("distribution", value)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Distribution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Distribution</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="External">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExportExcel} variant="outline" className="flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      <div className="flex justify-end pb-4 pt-2">
        {pagination && pagination.limit && (
          <PaginationComponent
            limit={pagination.limit}
            limitChange={handleLimitChange}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Dummy scrollbar at the top */}
      <div 
        ref={topScrollRef} 
        className="w-full overflow-x-scroll mb-2" 
        onScroll={handleTopScroll}
      >
        <div style={{ height: "1px" }}></div>
      </div>

      <div className="rounded-md border border-muted">
        <Table containerProps={{ ref: bottomScrollRef, onScroll: handleBottomScroll }}>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-primary text-primary-foreground rounded-tl-md">
                {t("printHistory.columns.no")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.documentName")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.documentCode")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                Departemen
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                Status Revisi
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.requester")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.distribution")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.picTaken")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.takenAt")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.status")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.dateRequested")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground">
                {t("printHistory.columns.copies")}
              </TableHead>
              <TableHead className="bg-primary text-primary-foreground rounded-tr-md text-center">
                {t("printHistory.columns.action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>{t("printHistory.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : groupedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center text-muted-foreground">
                  {t("printHistory.noHistory")}
                </TableCell>
              </TableRow>
            ) : (
              groupedRequests.map((group, index) => {
                const hasInternal = !!group.internal;
                const hasExternal = !!group.external;
                // Use the first available request for navigation
                const primaryRequest = group.internal || group.external;

                return (
                  <TableRow key={group.key}>
                    <TableCell>
                      {pagination?.page && pagination?.limit 
                        ? (pagination.page - 1) * pagination.limit + index + 1
                        : index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {group.document?.name || "Deleted Document"}
                    </TableCell>
                    <TableCell>{group.document?.documentCode || "-"}</TableCell>
                    <TableCell>{group.document?.department?.name || "-"}</TableCell>
                    <TableCell>{group.document?.revision !== undefined ? `Rev ${group.document.revision}` : "-"}</TableCell>
                    <TableCell>{group.requester?.fullName || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {hasInternal && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {t("printHistory.internalPti")}
                          </span>
                        )}
                        {hasExternal && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {t("printHistory.externalPti")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {hasInternal && (
                          <span className={group.internal.picTaken ? "" : "text-muted-foreground italic text-[10px]"}>
                            {group.internal.picTaken || "-"}
                          </span>
                        )}
                        {hasExternal && (
                          <span className={group.external.picTaken ? "" : "text-muted-foreground italic text-[10px]"}>
                            {group.external.picTaken || "-"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {hasInternal && (
                          <span className={group.internal.takenAt ? "" : "text-muted-foreground italic text-[10px]"}>
                            {group.internal.takenAt ? format(new Date(group.internal.takenAt), "dd MMM yyyy HH:mm") : "-"}
                          </span>
                        )}
                        {hasExternal && (
                          <span className={group.external.takenAt ? "" : "text-muted-foreground italic text-[10px]"}>
                            {group.external.takenAt ? format(new Date(group.external.takenAt), "dd MMM yyyy HH:mm") : "-"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getGroupStatusBadges(group)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(group.latestDate), "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-center">
                        {hasInternal && (
                          <span className="text-sm">
                            <span className="text-blue-600 font-medium">{group.internal.copies}</span>
                            {hasExternal && <span className="text-[10px] text-muted-foreground ml-1">(INT)</span>}
                          </span>
                        )}
                        {hasExternal && (
                          <span className="text-sm">
                            <span className="text-orange-600 font-medium">{group.external.copies}</span>
                            {hasInternal && <span className="text-[10px] text-muted-foreground ml-1">(EXT)</span>}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {/* Row 1: See Detail + Print buttons */}
                        <div className="flex justify-center items-center gap-1">
                          <Button
                            onClick={() => navigate(`/print-history/${primaryRequest.id}`)}
                            size="icon"
                            variant="outline"
                            className="text-primary border-primary hover:bg-primary hover:text-white h-8 w-8"
                            title={t("printHistory.viewDetail")}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Print Controlled */}
                          {isSuperAdmin && canPrint(group.internal) && (
                            <Button
                              onClick={() => handlePrintDocument(group.internal)}
                              size="icon"
                              variant="outline"
                              disabled={downloadingItems[group.internal.id]}
                              className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white h-8 w-8"
                              title={t("printHistory.printControlled")}
                            >
                              {downloadingItems[group.internal.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Printer className="w-4 h-4" />
                              )}
                            </Button>
                          )}

                          {/* Print Uncontrolled */}
                          {isSuperAdmin && canPrint(group.external) && (
                            <Button
                              onClick={() => handlePrintDocument(group.external)}
                              size="icon"
                              variant="outline"
                              disabled={downloadingItems[group.external.id]}
                              className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white h-8 w-8"
                              title={t("printHistory.printUncontrolled")}
                            >
                              {downloadingItems[group.external.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Printer className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Row 2: Mark Ready + Record Pickup */}
                        {isSuperAdmin && (canMarkReady(group.internal) || canMarkReady(group.external) || canRecordPickup(group.internal) || canRecordPickup(group.external)) && (
                          <div className="flex justify-center items-center gap-1">
                            {canMarkReady(group.internal) && (
                              <Button
                                onClick={() => handleMarkAsReady(group.internal.documentId, group.internal.id)}
                                size="icon" variant="outline"
                                className="text-cyan-600 border-cyan-600 hover:bg-cyan-600 hover:text-white h-7 w-7"
                                title={`${t("printHistory.markReady")} ${hasExternal ? '(INT)' : ''}`}
                              >
                                <PackageCheck className="w-3 h-3" />
                              </Button>
                            )}
                            {canMarkReady(group.external) && (
                              <Button
                                onClick={() => handleMarkAsReady(group.external.documentId, group.external.id)}
                                size="icon" variant="outline"
                                className="text-cyan-600 border-cyan-600 hover:bg-cyan-600 hover:text-white h-7 w-7"
                                title={`${t("printHistory.markReady")} ${hasInternal ? '(EXT)' : ''}`}
                              >
                                <PackageCheck className="w-3 h-3" />
                              </Button>
                            )}
                            {canRecordPickup(group.internal) && (
                              <Button
                                onClick={() => handleMarkAsTaken(group.internal.documentId, group.internal.id)}
                                size="icon" variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white h-7 w-7"
                                title={`${t("printHistory.recordPickup")} ${hasExternal ? '(INT)' : ''}`}
                              >
                                <UserCheck className="w-3 h-3" />
                              </Button>
                            )}
                            {canRecordPickup(group.external) && (
                              <Button
                                onClick={() => handleMarkAsTaken(group.external.documentId, group.external.id)}
                                size="icon" variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white h-7 w-7"
                                title={`${t("printHistory.recordPickup")} ${hasInternal ? '(EXT)' : ''}`}
                              >
                                <UserCheck className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end pt-2">
        {pagination && pagination.limit && (
          <PaginationComponent
            limit={pagination.limit}
            limitChange={handleLimitChange}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
