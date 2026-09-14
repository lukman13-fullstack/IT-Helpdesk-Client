import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  FileText,
  User,
  HardDrive,
  FileType,
  Loader2,
  Download,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { asyncGetDocumentHistoryActionCreator } from "@/store/documents/action";
import { useParams } from "react-router-dom";
import {
  downloadDocument,
  downloadMasterDocument,
  downloadDocumentHistory,
  downloadMasterDocumentHistory,
} from "@/services/api/documents";
import { notify } from "@/lib/toast";

export default function HistoryTab() {
  const dispatch = useAppDispatch();
  const { documentHistory, documentDetail, loading } = useAppSelector(
    (state) => state.documents
  );

  const { id } = useParams();

  const { user: authUser } = useAppSelector((state) => state.authUser);
  const isUserRole = authUser?.role?.name === "USER";

  // State untuk tracking selected history item index for detail view
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // State untuk tracking download per history item
  const [downloadingItems, setDownloadingItems] = useState<{
    [key: string]: { doc: boolean; master: boolean };
  }>({});

  useEffect(() => {
    if (id) {
      dispatch(asyncGetDocumentHistoryActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  const handlePreviewHistoryDocument = async (item: any, index: number) => {
    const key = item.id ? String(item.id) : `index-${index}`;

    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], doc: true },
      }));

      let blob;

      if (item.isCurrent || item.id === null || item.id === undefined) {
        const result = await downloadDocument(id!, item.name);
        blob = result.blob;
      } else {
        const result = await downloadDocumentHistory(item.id, item.name);
        blob = result.blob;
      }

      const url = window.URL.createObjectURL(blob);
      if (item.mimeType === "application/pdf" || !item.mimeType) {
        window.open(`${url}#toolbar=0&navpanes=0&scrollbar=0`, "_blank");
      } else {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Preview failed:", error);
      notify.error("Failed to preview document history");
    } finally {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], doc: false },
      }));
    }
  };

  const handleDownloadHistoryDocument = async (item: any, index: number) => {
    const key = item.id ? String(item.id) : `index-${index}`;

    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], doc: true },
      }));

      let blob, filename;

      if (item.isCurrent || item.id === null || item.id === undefined) {
        const result = await downloadDocument(id!, item.name);
        blob = result.blob;
        filename = result.filename;
      } else {
        const result = await downloadDocumentHistory(item.id, item.name);
        blob = result.blob;
        filename = result.filename;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      notify.error("Failed to download document");
    } finally {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], doc: false },
      }));
    }
  };

  const handleDownloadHistoryMaster = async (item: any, index: number) => {
    const key = item.id ? String(item.id) : `index-${index}`;

    if (!item.masterDocumentGoogleDriveId) {
      notify.error("Master document is not available");
      return;
    }

    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], master: true },
      }));

      let blob, filename;

      if (item.isCurrent || item.id === null || item.id === undefined) {
        const result = await downloadMasterDocument(id!, item.name);
        blob = result.blob;
        filename = result.filename;
      } else {
        const result = await downloadMasterDocumentHistory(item.id, item.name);
        blob = result.blob;
        filename = result.filename;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Master download failed:", error);
      notify.error("Failed to download master document");
    } finally {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], master: false },
      }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (size: number | null) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading && documentHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!documentHistory || documentHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No history available</p>
        </CardContent>
      </Card>
    );
  }

  const selectedHistory = selectedIndex !== null ? documentHistory[selectedIndex] : null;

  // Detail View for a specific history item
  if (selectedIndex !== null && selectedHistory) {
    const index = selectedIndex;
    const itemKey = selectedHistory.id ? String(selectedHistory.id) : `index-${index}`;
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedIndex(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-full px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-bold uppercase tracking-wider text-[10px]">Back to History</span>
            </Button>
            <div className="h-4 w-[1px] bg-muted mx-2" />
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Document History</h2>
              <p className="text-[10px] text-muted-foreground font-medium">Track all revisions and changes made to this document</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">Revision</span>
                      <span className="text-xs font-mono font-black text-primary">
                        v{selectedHistory.version}.{String(selectedHistory.revision).padStart(2, '0')}
                      </span>
                    </div>
                    {index === 0 && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-lg shadow-orange-500/20 border-none rounded-full">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-primary uppercase leading-tight">
                    {selectedHistory.name}
                  </h1>
                </div>
                <div className="bg-muted/30 px-5 py-3 rounded-2xl border border-muted/50 flex flex-col items-end min-w-fit whitespace-nowrap hidden sm:flex">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1.5">Release Date</span>
                  <div className="flex items-center gap-1.5 w-full justify-end">
                    <Clock className="h-4 w-4 text-primary opacity-80" strokeWidth={2.5} />
                    <span className="text-sm font-bold text-foreground leading-none mt-0.5">
                      {formatDate(selectedHistory.releaseDate)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Detail Information</span>
                </div>

                {selectedHistory.revisionPurpose && selectedHistory.revisionPurpose !== "-" && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-2">Revision Purpose</span>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                      <div className="relative text-sm text-foreground bg-white p-4 rounded-xl border border-primary/5 leading-relaxed shadow-sm italic font-medium">
                        "{selectedHistory.revisionPurpose}"
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedHistory.changeDescription && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-2">Change Description</span>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                      <div className="relative text-sm text-foreground bg-white p-4 rounded-xl border border-primary/5 leading-relaxed shadow-sm italic font-medium">
                        "{selectedHistory.changeDescription}"
                      </div>
                    </div>
                  </div>
                )}

                {Boolean(
                  documentDetail?.category ||
                  documentDetail?.isInternal !== undefined ||
                  documentDetail?.name ||
                  documentDetail?.proposalObjective ||
                  documentDetail?.documentFormat ||
                  documentDetail?.retentionPeriod ||
                  documentDetail?.hardDocumentRetentionPeriod ||
                  documentDetail?.storageLocation ||
                  documentDetail?.hardDocumentStorageLocation ||
                  documentDetail?.publishingInstitution ||
                  documentDetail?.dateOfIssue ||
                  documentDetail?.expiredDate ||
                  documentDetail?.remark
                ) && (
                  <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-100/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                      {documentDetail?.isInternal !== undefined && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Document Type</span>
                          <span className="text-sm font-semibold text-orange-950 capitalize">{documentDetail.isInternal ? "Internal Document" : "External Document"}</span>
                        </div>
                      )}
                      {documentDetail?.category && documentDetail.isInternal && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Category</span>
                          <span className="text-sm font-semibold text-orange-950 capitalize">{documentDetail.category.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {documentDetail?.name && (
                        <div className="flex flex-col gap-1.5 md:col-span-1">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Document Name</span>
                          <span className="text-sm font-semibold text-orange-950">{documentDetail.name}</span>
                        </div>
                      )}
                      {documentDetail?.proposalObjective && (
                        <div className="flex flex-col gap-1.5 md:col-span-1">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Proposal Objective</span>
                          <span className="text-sm font-medium text-orange-950 whitespace-pre-wrap">{documentDetail.proposalObjective}</span>
                        </div>
                      )}
                      {documentDetail?.documentFormat && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Document Format</span>
                          <span className="text-sm font-semibold text-orange-950 capitalize">{documentDetail.documentFormat.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {documentDetail?.retentionPeriod && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Retention Period</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={documentDetail.retentionPeriod}>
                            {documentDetail.retentionPeriod}
                          </span>
                        </div>
                      )}
                      {documentDetail?.hardDocumentRetentionPeriod && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Hard Copy Retention</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={documentDetail.hardDocumentRetentionPeriod}>
                            {documentDetail.hardDocumentRetentionPeriod}
                          </span>
                        </div>
                      )}
                      {documentDetail?.storageLocation && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Storage Location</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={documentDetail.storageLocation}>
                            {documentDetail.storageLocation}
                          </span>
                        </div>
                      )}
                      {documentDetail?.hardDocumentStorageLocation && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Hard Copy Storage</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={documentDetail.hardDocumentStorageLocation}>
                            {documentDetail.hardDocumentStorageLocation}
                          </span>
                        </div>
                      )}
                      {documentDetail?.publishingInstitution && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Publishing Inst.</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={documentDetail.publishingInstitution}>
                            {documentDetail.publishingInstitution}
                          </span>
                        </div>
                      )}
                      {documentDetail?.dateOfIssue && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Date of Issue</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={formatDate(documentDetail.dateOfIssue)}>
                            {formatDate(documentDetail.dateOfIssue)}
                          </span>
                        </div>
                      )}
                      {documentDetail?.expiredDate && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Expired Date</span>
                          <span className="text-sm font-semibold text-orange-950 truncate" title={formatDate(documentDetail.expiredDate)}>
                            {formatDate(documentDetail.expiredDate)}
                          </span>
                        </div>
                      )}
                      {documentDetail?.remark && (
                        <div className="flex flex-col gap-1.5 md:col-span-1">
                          <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Remark</span>
                          <span className="text-sm font-medium text-orange-950 whitespace-pre-wrap">
                            {documentDetail.remark}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed border-muted">
                <div className="flex items-center gap-2 text-primary">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">General Specifications</span>
                </div>
                <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-100/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">File Size</span>
                      <span className="text-sm font-semibold text-orange-950">{formatFileSize(selectedHistory.fileSize)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Mime Type</span>
                      <span className="text-sm font-semibold text-orange-950 truncate" title={selectedHistory.mimeType}>{selectedHistory.mimeType}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Revision ID</span>
                      <span className="text-sm font-semibold text-orange-950">REV-{String(selectedHistory.revision).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedHistory.masterDocumentGoogleDriveId && (
                <div className="space-y-4 pt-4 border-t border-dashed border-muted">
                  <div className="flex items-center gap-2 text-primary">
                    <FileType className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Master File Properties</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-100/50 flex flex-col gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Master Size</span>
                        <span className="text-sm font-semibold text-orange-950">{formatFileSize(selectedHistory.masterDocumentFileSize)}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-wider">Format Info</span>
                        <span className="text-sm font-semibold text-orange-950 truncate" title={selectedHistory.masterDocumentMimeType || "-"}>
                          {selectedHistory.masterDocumentMimeType || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Panel: Actions & Contributor */}
          <div className="space-y-6">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
              <div className="p-6 space-y-6 text-center">
                 <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary rotate-3 transform group-hover:rotate-0 transition-transform">
                      <Download className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] mt-2">Available Actions</h3>
                 </div>
                 
                 <div className="flex flex-col gap-3 pt-2">
                    {index < 2 ? (
                      <>
                        {!isUserRole || authUser?.id === selectedHistory.changer?.id || authUser?.id === documentDetail?.uploadedBy ? (
                          <>
                            <Button
                              className="bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-2xl shadow-xl shadow-primary/20 w-full uppercase text-[10px] tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                              onClick={() => handleDownloadHistoryDocument(selectedHistory, index)}
                              disabled={downloadingItems[itemKey]?.doc}
                            >
                              {downloadingItems[itemKey]?.doc ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="mr-2 h-4 w-4" />
                              )}
                              Download Final PDF
                            </Button>
                            {selectedHistory.masterDocumentGoogleDriveId && (
                              <Button
                                variant="outline"
                                className="border-primary/20 text-primary hover:bg-primary/5 font-black h-12 rounded-2xl w-full uppercase text-[10px] tracking-widest transition-all"
                                onClick={() => handleDownloadHistoryMaster(selectedHistory, index)}
                                disabled={downloadingItems[itemKey]?.master}
                              >
                                {downloadingItems[itemKey]?.master ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <FileType className="mr-2 h-4 w-4" />
                                )}
                                Download Master
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            className="bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-2xl shadow-xl shadow-primary/20 w-full uppercase text-[10px] tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => handlePreviewHistoryDocument(selectedHistory, index)}
                            disabled={downloadingItems[itemKey]?.doc}
                          >
                            {downloadingItems[itemKey]?.doc ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="mr-2 h-4 w-4" />
                            )}
                            Preview Document
                          </Button>
                        )}
                      </>
                    ) : (
                       <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                            Actions are only available for the latest two versions.
                          </p>
                       </div>
                    )}
                 </div>
              </div>
            </Card>

            {selectedHistory.changer && (
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-primary/5 rounded-[2rem] overflow-hidden">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center p-1 shadow-md border-2 border-primary/20">
                      <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em]">Revision Author</p>
                    <h4 className="text-lg font-black text-primary leading-tight">{selectedHistory.changer.fullName}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">{selectedHistory.changer.email}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Summary Table View (Default)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black text-primary uppercase tracking-[0.2em]">Document History</h1>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-1 ml-[52px]">Track all revisions and changes made to this document</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-primary/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-primary/5">
              <TableHead className="w-[80px] font-black py-6 text-primary text-center text-xs uppercase tracking-widest">No</TableHead>
              <TableHead className="font-black text-primary text-xs uppercase tracking-widest">Name Document</TableHead>
              <TableHead className="font-black text-primary text-xs uppercase tracking-widest">No Document</TableHead>
              <TableHead className="font-black text-primary text-center text-xs uppercase tracking-widest">Revision</TableHead>
              <TableHead className="font-black text-primary text-xs uppercase tracking-widest">Release Date</TableHead>
              <TableHead className="font-black text-primary text-xs uppercase tracking-widest">Changes</TableHead>
              <TableHead className="font-black text-primary text-xs uppercase tracking-widest">Privileges</TableHead>
              <TableHead className="font-black text-primary text-center w-[120px] text-xs uppercase tracking-widest">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentHistory.map((item, index) => {
              const canDoAction = index < 2;
              let detailActionText = "-";
              
              if (canDoAction) {
                if (isUserRole) {
                  detailActionText = "View Only PDF";
                } else {
                  detailActionText = "View PDF & Master";
                }
              }

              return (
                <TableRow key={item.id ? `id-${item.id}` : `idx-${index}`} className="group transition-all duration-300 hover:bg-primary/[0.02]">
                  <TableCell className="py-6 font-black text-muted-foreground/60 text-center text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 focus:outline-none">
                      <span className="font-black text-sm text-primary uppercase tracking-tight group-hover:translate-x-1 transition-transform inline-block">
                        {item.name || documentDetail?.name}
                      </span>
                      <div className="flex items-center gap-2">
                         <div className="px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-black text-primary font-mono">
                           v{item.version}.{String(item.revision).padStart(2, '0')}
                         </div>
                         {index === 0 && (
                            <div className="relative flex h-2 w-2 ml-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                              <span className="ml-3 text-[10px] font-black text-orange-600 uppercase tracking-widest">Latest</span>
                            </div>
                         )}
                      </div>
                      
                      {item.changer && (
                        <div className="flex items-center gap-1.5 mt-1 opacity-60 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                          <User className="h-3.5 w-3.5 text-primary/60" />
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Changed by: <span className="font-bold text-primary">{item.changer.fullName}</span> 
                            <span className="ml-1">({item.changer.email})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-black text-muted-foreground">
                    {documentDetail?.documentCode || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-primary">
                      {String(item.revision).padStart(2, '0')}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground/80">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 opacity-50 text-primary" />
                      {formatDate(item.releaseDate)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium opacity-70 group-hover:opacity-100 transition-opacity" title={item.changeDescription ?? undefined}>
                      {item.changeDescription || "No notes available"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {detailActionText !== "-" ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.04] border border-primary/10">
                        <div className={`h-2 w-2 rounded-full ${isUserRole ? 'bg-blue-400' : 'bg-orange-400'}`} />
                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">{detailActionText}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs font-black ml-4">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 text-primary hover:bg-primary hover:text-white rounded-[1.25rem] transition-all group-hover:shadow-xl group-hover:shadow-primary/20 active:scale-90"
                      onClick={() => setSelectedIndex(index)}
                      title="View Full Specifications"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
