import { getCategoryLabel } from "@/utils/categoryLabels";
import Layout from "@/components/layout/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, User, FileText, Printer, CheckCircle2, Clock, UserCheck, PackageCheck } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState, useMemo } from "react";
import { asyncGetPrintDetailActionCreator, asyncGetPrintHistoryActionCreator } from "@/store/printRequests/action";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { notify } from "@/lib/toast";
import { markAsReady, markAsTaken, downloadPrintFile, markAsPrinted } from "@/services/api/documents";

export default function PrintHistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { printDetail, printHistory, loading } = useAppSelector((state) => state.printRequests);
  const { user } = useAppSelector((state) => state.authUser);
  const isSuperAdmin = user?.role?.name === "Super Admin" || user?.role?.name === "SUPER_ADMIN";
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetPrintDetailActionCreator(id));
    }
  }, [dispatch, id]);

  // After printDetail loads, fetch all print history for the same document to find sibling
  useEffect(() => {
    if (printDetail?.documentId) {
      dispatch(asyncGetPrintHistoryActionCreator(printDetail.documentId));
    }
  }, [dispatch, printDetail?.documentId]);

  // Find internal and external requests for the same requester
  const { internalRequest, externalRequest } = useMemo(() => {
    if (!printDetail || !printHistory) return { internalRequest: null, externalRequest: null };

    const sameRequester = printHistory.filter(
      (item: any) => item.requesterId === printDetail.requesterId
    );

    return {
      internalRequest: sameRequester.find((r: any) => r.isInternal) || null,
      externalRequest: sameRequester.find((r: any) => !r.isInternal) || null,
    };
  }, [printDetail, printHistory]);

  const refreshData = () => {
    if (id) dispatch(asyncGetPrintDetailActionCreator(id));
    if (printDetail?.documentId) dispatch(asyncGetPrintHistoryActionCreator(printDetail.documentId));
  };

  const handleMarkAsReady = async (request: any) => {
    if (!request) return;
    try {
      await markAsReady(request.documentId, request.id);
      notify.success(`${request.isInternal ? "Controlled" : "Uncontrolled"} marked as ready.`);
      refreshData();
    } catch (error: any) {
      notify.error(error.message || "Failed to mark as ready");
    }
  };

  const handleMarkAsTaken = async (request: any) => {
    if (!request) return;
    const picName = prompt("Enter PIC Name who took the document:");
    if (!picName) return;

    try {
      await markAsTaken(request.documentId, request.id, { picTaken: picName });
      notify.success(`${request.isInternal ? "Controlled" : "Uncontrolled"} pickup recorded.`);
      refreshData();
    } catch (error: any) {
      notify.error(error.message || "Failed to record pickup");
    }
  };

  const handlePrintDocument = async (request: any) => {
    if (!request) return;

    const type = request.isInternal ? "controlled" : "uncontrolled";
    try {
      setDownloadingType(type);

      const { blob, filename } = await downloadPrintFile(
        request.documentId,
        request.document?.name || printDetail?.document?.name || "document",
        type,
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

      refreshData();

      notify.success(
        `${request.isInternal ? "Controlled" : "Uncontrolled"} document downloaded and marked as printed`
      );
    } catch (error: any) {
      console.error("Print failed:", error);
      notify.error(error.message || "Failed to print document");
    } finally {
      setDownloadingType(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", className: "bg-blue-100 text-blue-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      printed: { label: "Printed", className: "bg-purple-100 text-purple-800" },
      ready: { label: "Ready", className: "bg-cyan-100 text-cyan-800" },
      completed: { label: "Taken", className: "bg-green-100 text-green-800" },
    };

    const config = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Helpers for determining available actions
  const canPrint = (req: any) => req && ["approved", "printed", "ready", "completed"].includes(req.status);
  const canMarkReady = (req: any) => req && ["approved", "printed"].includes(req.status);
  const canRecordPickup = (req: any) => req && req.status === "ready";

  const hasAnyAction = canPrint(internalRequest) || canPrint(externalRequest) ||
    canMarkReady(internalRequest) || canMarkReady(externalRequest) ||
    canRecordPickup(internalRequest) || canRecordPickup(externalRequest);

  return (
    <Layout
      title="Print History Detail"
      items={[{ label: "Print History", href: "/print-history" }]}
    >
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/print-history")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Print History
        </Button>

        {loading && !printDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !printDetail ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <p className="text-muted-foreground">Print history record not found.</p>
            <Button onClick={() => navigate("/print-history")} variant="ghost" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Print History
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="bg-muted/50 pb-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Printer className="w-6 h-6" />
                        Print Request #{printDetail.id}
                      </CardTitle>
                      <CardDescription>
                        Requested on {printDetail.createdAt ? format(new Date(printDetail.createdAt), "PPP p") : "-"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {internalRequest && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-blue-600 font-bold">INT:</span>
                          {getStatusBadge(internalRequest.status)}
                        </div>
                      )}
                      {externalRequest && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-orange-600 font-bold">EXT:</span>
                          {getStatusBadge(externalRequest.status)}
                        </div>
                      )}
                      {!internalRequest && !externalRequest && getStatusBadge(printDetail.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Document Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Document Name</p>
                        <p className="font-semibold text-base">{printDetail.document?.name || "Deleted Document"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Document Code</p>
                        <p className="font-semibold text-base">{printDetail.document?.documentCode || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Department</p>
                        <p className="text-base">{printDetail.document?.department?.name || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Category</p>
                        <p className="text-base">{getCategoryLabel(printDetail.document?.category || "") || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Request Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Requester</p>
                        <p className="font-semibold text-base">{printDetail.requester?.fullName || "-"}</p>
                        <p className="text-muted-foreground text-xs">{printDetail.requester?.email || ""}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Position</p>
                        <p className="text-base">{printDetail.requester?.position || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Distribution</p>
                        <div className="flex gap-2">
                          {internalRequest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Internal PTI ({internalRequest.copies} copies)
                            </span>
                          )}
                          {externalRequest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              External PTI ({externalRequest.copies} copies)
                            </span>
                          )}
                          {!internalRequest && !externalRequest && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              printDetail.isInternal ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                            }`}>
                              {printDetail.isInternal ? "Internal PTI" : "External PTI"} ({printDetail.copies} copies)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Reason</p>
                        <p className="italic text-base">"{printDetail.reason || "No reason provided"}"</p>
                      </div>
                    </div>
                  </div>

                  {printDetail.status === "completed" && (
                    <>
                      <Separator />
                      <div className="space-y-4 p-4 bg-green-50/50 rounded-lg border border-green-100">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-5 h-5" />
                          Collection Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-1">
                            <p className="text-green-600 font-medium uppercase text-[10px] tracking-wider">PIC Taken</p>
                            <p className="font-semibold text-base text-green-800">{printDetail.picTaken || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-green-600 font-medium uppercase text-[10px] tracking-wider">Taken At</p>
                            <p className="text-base text-green-800">{printDetail.takenAt ? format(new Date(printDetail.takenAt), "PPP p") : "-"}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Actions Card - Shows both Controlled and Uncontrolled side by side */}
              {isSuperAdmin && hasAnyAction && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Print Buttons - side by side */}
                    {(canPrint(internalRequest) || canPrint(externalRequest)) && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Print Document</p>
                        <div className="flex gap-2">
                          {canPrint(internalRequest) && (
                            <Button 
                              onClick={() => handlePrintDocument(internalRequest)}
                              disabled={downloadingType === "controlled"}
                              className="flex-1 gap-2 font-bold bg-blue-600 hover:bg-blue-700"
                            >
                              {downloadingType === "controlled" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Printer className="w-4 h-4" />
                              )}
                              Controlled
                            </Button>
                          )}
                          {canPrint(externalRequest) && (
                            <Button 
                              onClick={() => handlePrintDocument(externalRequest)}
                              disabled={downloadingType === "uncontrolled"}
                              className="flex-1 gap-2 font-bold bg-orange-600 hover:bg-orange-700"
                            >
                              {downloadingType === "uncontrolled" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Printer className="w-4 h-4" />
                              )}
                              Uncontrolled
                            </Button>
                          )}
                        </div>
                      </div>
                    )}



                    {/* Mark Ready Buttons */}
                    {(canMarkReady(internalRequest) || canMarkReady(externalRequest)) && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mark as Ready</p>
                        <div className="flex gap-2">
                          {canMarkReady(internalRequest) && (
                            <Button 
                              onClick={() => handleMarkAsReady(internalRequest)}
                              className="flex-1 bg-cyan-600 hover:bg-cyan-700 gap-2"
                            >
                              <PackageCheck className="w-4 h-4" />
                              {internalRequest && externalRequest ? "Ready (INT)" : "Mark Ready"}
                            </Button>
                          )}
                          {canMarkReady(externalRequest) && (
                            <Button 
                              onClick={() => handleMarkAsReady(externalRequest)}
                              className="flex-1 bg-cyan-600 hover:bg-cyan-700 gap-2"
                            >
                              <PackageCheck className="w-4 h-4" />
                              {internalRequest && externalRequest ? "Ready (EXT)" : "Mark Ready"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Record Pickup Buttons */}
                    {(canRecordPickup(internalRequest) || canRecordPickup(externalRequest)) && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Record Pickup</p>
                        <div className="flex gap-2">
                          {canRecordPickup(internalRequest) && (
                            <Button 
                              onClick={() => handleMarkAsTaken(internalRequest)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              {internalRequest && externalRequest ? "Pickup (INT)" : "Record Pickup"}
                            </Button>
                          )}
                          {canRecordPickup(externalRequest) && (
                            <Button 
                              onClick={() => handleMarkAsTaken(externalRequest)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              {internalRequest && externalRequest ? "Pickup (EXT)" : "Record Pickup"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 font-bold">
                    <Clock className="w-5 h-5 text-primary" />
                    Approval Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {printDetail.digitalApprovals && printDetail.digitalApprovals.length > 0 ? (
                    <div className="space-y-0">
                      {printDetail.digitalApprovals.map((approval: any, idx: number) => (
                        <div key={approval.id || idx} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-muted ml-1">
                          <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{approval.approver?.fullName || "Approver"}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-medium">Level {approval.level}</span>
                            </div>
                            <div>
                              {getStatusBadge(approval.status)}
                            </div>
                            {approval.approvedAt && (
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {format(new Date(approval.approvedAt), "dd MMM yyyy, HH:mm")}
                              </p>
                            )}
                            {approval.comments && (
                              <div className="text-xs italic text-muted-foreground mt-2 p-2 bg-muted/30 rounded border-l-2 border-muted text-pretty">
                                "{approval.comments}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground italic">No approval history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Process Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {internalRequest && externalRequest ? (
                    /* Both types exist - show separate milestones */
                    <div className="space-y-5">
                      {/* Controlled (Internal) Milestones */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Controlled (Internal)</span>
                        </div>
                        <div className="ml-5 space-y-2">
                          <div className="flex justify-between items-center border-b border-muted pb-2">
                            <span className="text-muted-foreground font-medium">Printed At</span>
                            <span className="font-semibold">{internalRequest.printedAt ? format(new Date(internalRequest.printedAt), "dd MMM yyyy HH:mm") : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-muted pb-2">
                            <span className="text-muted-foreground font-medium">Ready At</span>
                            <span className="font-semibold">{internalRequest.readyAt ? format(new Date(internalRequest.readyAt), "dd MMM yyyy HH:mm") : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-muted pb-2">
                            <span className="text-muted-foreground font-medium">Taken At</span>
                            <span className="font-semibold">{internalRequest.takenAt ? format(new Date(internalRequest.takenAt), "dd MMM yyyy HH:mm") : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Expires At</span>
                            <span className="text-red-500 font-bold">{internalRequest.expiresAt ? format(new Date(internalRequest.expiresAt), "dd MMM yyyy") : "-"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Uncontrolled (External) Milestones */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Uncontrolled (External)</span>
                        </div>
                        <div className="ml-5 space-y-2">
                          <div className="flex justify-between items-center border-b border-muted pb-2">
                            <span className="text-muted-foreground font-medium">Printed At</span>
                            <span className="font-semibold">{externalRequest.printedAt ? format(new Date(externalRequest.printedAt), "dd MMM yyyy HH:mm") : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-muted pb-2">
                            <span className="text-muted-foreground font-medium">Ready At</span>
                            <span className="font-semibold">{externalRequest.readyAt ? format(new Date(externalRequest.readyAt), "dd MMM yyyy HH:mm") : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-muted pb-2">
                            <span className="text-muted-foreground font-medium">Taken At</span>
                            <span className="font-semibold">{externalRequest.takenAt ? format(new Date(externalRequest.takenAt), "dd MMM yyyy HH:mm") : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Expires At</span>
                            <span className="text-red-500 font-bold">{externalRequest.expiresAt ? format(new Date(externalRequest.expiresAt), "dd MMM yyyy") : "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Only one type - show single milestones */
                    <>
                      <div className="flex justify-between items-center border-b border-muted pb-3">
                        <span className="text-muted-foreground font-medium">Printed At</span>
                        <span className="font-semibold">{printDetail.printedAt ? format(new Date(printDetail.printedAt), "dd MMM yyyy HH:mm") : "-"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted pb-3">
                        <span className="text-muted-foreground font-medium">Ready At</span>
                        <span className="font-semibold">{printDetail.readyAt ? format(new Date(printDetail.readyAt), "dd MMM yyyy HH:mm") : "-"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-muted pb-3">
                        <span className="text-muted-foreground font-medium">Taken At</span>
                        <span className="font-semibold">{printDetail.takenAt ? format(new Date(printDetail.takenAt), "dd MMM yyyy HH:mm") : "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Expires At</span>
                        <span className="text-red-500 font-bold">{printDetail.expiresAt ? format(new Date(printDetail.expiresAt), "dd MMM yyyy") : "-"}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
