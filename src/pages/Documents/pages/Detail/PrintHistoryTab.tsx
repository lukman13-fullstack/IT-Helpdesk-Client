import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Clock, User, MapPin, Copy, UserCheck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import { markAsReady, markAsTaken, downloadPrintFile, markAsPrinted } from "@/services/api/documents";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { asyncGetPrintHistoryActionCreator } from "@/store/printRequests/action";

interface GroupedRequest {
  key: string;
  internal: any | null;
  external: any | null;
  requester: any;
  latestDate: string;
  reason: string;
  storageLocation: string;
  approver: any;
  approvedAt: string | null;
}

export default function PrintHistoryTab() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { printHistory, loading } = useAppSelector(
    (state) => state.printRequests
  );
  const [downloadingItems, setDownloadingItems] = useState<{[key: number]: boolean}>({});
  const { documentDetail } = useAppSelector((state) => state.documents);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetPrintHistoryActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  // Group print requests by requester - combine internal+external into one row
  const groupedHistory = useMemo(() => {
    const groups = new Map<number, GroupedRequest>();

    printHistory.forEach((item: any) => {
      const key = item.requesterId;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          key: `group-${key}`,
          internal: item.isInternal ? item : null,
          external: !item.isInternal ? item : null,
          requester: item.requester,
          latestDate: item.createdAt,
          reason: item.reason,
          storageLocation: item.storageLocation,
          approver: item.approver,
          approvedAt: item.approvedAt,
        });
      } else {
        if (item.isInternal && !existing.internal) {
          existing.internal = item;
        } else if (!item.isInternal && !existing.external) {
          existing.external = item;
        }
        if (new Date(item.createdAt) > new Date(existing.latestDate)) {
          existing.latestDate = item.createdAt;
          existing.reason = item.reason || existing.reason;
        }
        if (item.approver && !existing.approver) {
          existing.approver = item.approver;
          existing.approvedAt = item.approvedAt;
        }
      }
    });

    return Array.from(groups.values());
  }, [printHistory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "printed":
        return <Badge className="bg-purple-100 text-purple-800">Printed</Badge>;
      case "ready":
        return <Badge className="bg-blue-100 text-blue-800">Ready</Badge>;
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800">Taken</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-gray-500 border-gray-300">Expired</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Combined status: "Taken" only if ALL requests in group are completed
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
          <span className="text-[10px] text-purple-600 font-bold">EXT:</span>
          {getStatusBadge(group.external.status)}
        </div>
      );
    }
    return <div className="flex flex-col gap-1">{badges}</div>;
  };

  const { user } = useAppSelector((state) => state.authUser);
  const isSuperAdmin = user?.role?.name === "Super Admin" || user?.role?.name === "SUPER_ADMIN";

  const handleMarkAsReady = async (printRequestId: number) => {
    if (!id) return;
    try {
      await markAsReady(id, printRequestId);
      notify.success("Document marked as ready. Requester notified.");
      dispatch(asyncGetPrintHistoryActionCreator(Number(id)));
    } catch (error: any) {
      notify.error(error.message || "Failed to mark as ready");
    }
  };

  const handleMarkAsTaken = async (printRequestId: number) => {
    if (!id) return;
    const picName = prompt("Enter PIC Name who took the document:");
    if (!picName) return;

    try {
      await markAsTaken(id, printRequestId, { picTaken: picName });
      notify.success("Document pickup recorded.");
      dispatch(asyncGetPrintHistoryActionCreator(Number(id)));
    } catch (error: any) {
      notify.error(error.message || "Failed to record pickup");
    }
  };

  const handlePrintDocument = async (item: any) => {
    if (!id || !item) return;

    try {
      setDownloadingItems(prev => ({ ...prev, [item.id]: true }));

      const { blob, filename } = await downloadPrintFile(
        item.documentId || Number(id),
        item.document?.name || documentDetail?.name || "document",
        item.isInternal ? "controlled" : "uncontrolled",
        item.id
      );

      await markAsPrinted(item.documentId || Number(id), item.id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      dispatch(asyncGetPrintHistoryActionCreator(Number(id)));

      notify.success(
        `${item.isInternal ? "Controlled" : "Uncontrolled"} document downloaded and marked as printed`
      );
    } catch (error: any) {
      console.error("Print failed:", error);
      notify.error(error.message || "Failed to print document");
    } finally {
      setDownloadingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Check if any request in group needs a specific action
  const canPrint = (req: any) => req && ["approved", "printed", "ready"].includes(req.status);
  const canMarkReady = (req: any) => req && ["approved", "printed"].includes(req.status);
  const canRecordPickup = (req: any) => req && req.status === "ready";

  if (loading && printHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (printHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No print history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Print History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Distribution</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approver</TableHead>
              {isSuperAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedHistory.map((group) => {
              const hasInternal = !!group.internal;
              const hasExternal = !!group.external;

              return (
                <TableRow key={group.key}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(group.latestDate), "dd MMM yyyy, HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {group.requester.fullName}
                    </div>
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={group.reason}
                  >
                    {group.reason}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {hasInternal && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Internal PTI
                        </span>
                      )}
                      {hasExternal && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          External PTI
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {hasInternal && (
                        <div className="flex items-center gap-1 text-sm">
                          <Copy className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-700 font-medium">{group.internal.copies}</span>
                          <span className="text-[10px] text-muted-foreground">(INT)</span>
                        </div>
                      )}
                      {hasExternal && (
                        <div className="flex items-center gap-1 text-sm">
                          <Copy className="h-3 w-3 text-purple-600" />
                          <span className="text-purple-700 font-medium">{group.external.copies}</span>
                          <span className="text-[10px] text-muted-foreground">(EXT)</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {group.storageLocation}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getGroupStatusBadges(group)}
                  </TableCell>
                  <TableCell>
                    {group.approver ? (
                      <div className="flex flex-col text-sm">
                        <span>{group.approver.fullName}</span>
                        {group.approvedAt && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(group.approvedAt), "dd MMM HH:mm")}
                          </span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* Print buttons side by side */}
                        <div className="flex gap-2">
                          {canPrint(group.internal) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => handlePrintDocument(group.internal)}
                              disabled={downloadingItems[group.internal.id]}
                            >
                              {downloadingItems[group.internal.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Printer className="h-4 w-4 mr-1" />
                              )}
                              Print Controlled
                            </Button>
                          )}
                          {canPrint(group.external) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                              onClick={() => handlePrintDocument(group.external)}
                              disabled={downloadingItems[group.external.id]}
                            >
                              {downloadingItems[group.external.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Printer className="h-4 w-4 mr-1" />
                              )}
                              Print Uncontrolled
                            </Button>
                          )}
                        </div>
                        {/* Mark Ready & Record Pickup */}
                        <div className="flex gap-2">
                          {canMarkReady(group.internal) && (
                            <Button
                              variant="outline" size="sm"
                              className="h-7 px-2 text-xs border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                              onClick={() => handleMarkAsReady(group.internal.id)}
                            >
                              <PackageCheck className="h-3 w-3 mr-1" /> Ready (INT)
                            </Button>
                          )}
                          {canMarkReady(group.external) && (
                            <Button
                              variant="outline" size="sm"
                              className="h-7 px-2 text-xs border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                              onClick={() => handleMarkAsReady(group.external.id)}
                            >
                              <PackageCheck className="h-3 w-3 mr-1" /> Ready (EXT)
                            </Button>
                          )}
                          {canRecordPickup(group.internal) && (
                            <Button
                              variant="outline" size="sm"
                              className="h-7 px-2 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => handleMarkAsTaken(group.internal.id)}
                            >
                              <UserCheck className="h-3 w-3 mr-1" /> Pickup (INT)
                            </Button>
                          )}
                          {canRecordPickup(group.external) && (
                            <Button
                              variant="outline" size="sm"
                              className="h-7 px-2 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => handleMarkAsTaken(group.external.id)}
                            >
                              <UserCheck className="h-3 w-3 mr-1" /> Pickup (EXT)
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
