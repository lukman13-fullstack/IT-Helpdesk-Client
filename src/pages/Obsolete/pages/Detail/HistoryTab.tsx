import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  FileText,
  User,
  GitBranch,
  HardDrive,
  FileType,
  Loader2,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { asyncGetDocumentHistoryActionCreator } from "@/store/documents/action";
import { useParams } from "react-router-dom";
import {
  downloadObsoleteDocument,
  downloadObsoleteMasterDocument,
} from "@/services/api/documents";
import { notify } from "@/lib/toast";

interface HistoryTabProps {
  canDownload?: boolean;
}

export default function HistoryTab({ canDownload = false }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const { documentHistory, loading } = useAppSelector(
    (state) => state.documents
  );

  const { id } = useParams();

  // State untuk tracking download per history item
  const [downloadingItems, setDownloadingItems] = useState<{
    [key: number]: { doc: boolean; master: boolean };
  }>({});

  useEffect(() => {
    if (id) {
      dispatch(asyncGetDocumentHistoryActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  const handleDownloadHistoryDocument = async (item: {
    id: number | null;
    googleDriveFileId: string;
    name: string;
    isCurrent?: boolean;
  }) => {
    // Use a key for tracking download state
    const key = item.id ?? 0; // Use 0 for current document

    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], doc: true },
      }));

      // For obsolete documents, we only use the obsolete download API
      const { blob, filename } = await downloadObsoleteDocument(
        id!,
        item.name
      );

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

  const handleDownloadHistoryMaster = async (item: {
    id: number | null;
    masterDocumentGoogleDriveId: string | null;
    name: string;
    isCurrent?: boolean;
  }) => {
    const key = item.id ?? 0;

    if (!item.masterDocumentGoogleDriveId) {
      notify.error("Master document is not available");
      return;
    }

    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [key]: { ...prev[key], master: true },
      }));

      // For obsolete documents, use obsolete master download API
      const { blob, filename } = await downloadObsoleteMasterDocument(
        id!,
        item.name
      );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Document History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documentHistory.map((item, index) => (
            <div
              key={item.id}
              className="relative pl-8 pb-8 border-l-2 border-muted last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />

              <Card className="ml-4">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          v{item.version}.{item.revision}
                        </Badge>
                        {index === 0 && <Badge variant="default">Latest</Badge>}
                        <Badge variant="destructive" className="text-xs">
                          OBSOLETE
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDate(item.releaseDate)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Change Description */}
                  {item.changeDescription && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Change Description
                      </p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {item.changeDescription}
                      </p>
                    </div>
                  )}

                  {item.description && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        File Information
                      </p>

                      {canDownload && index < 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadHistoryDocument(item)}
                          disabled={downloadingItems[item.id ?? 0]?.doc}
                        >
                          {downloadingItems[item.id ?? 0]?.doc ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          {downloadingItems[item.id ?? 0]?.doc
                            ? "Downloading..."
                            : "Download"}
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          File Size
                        </p>
                        <p className="font-medium text-sm">
                          {formatFileSize(item.fileSize)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <FileType className="h-4 w-4" />
                          Type
                        </p>
                        <p className="font-medium text-sm">{item.mimeType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          Revision
                        </p>
                        <p className="font-medium text-sm">{item.revision}</p>
                      </div>
                    </div>
                  </div>

                  {/* Master Document Info */}
                  {item.masterDocumentGoogleDriveId && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Master Document Information
                          </p>
                          {canDownload && index < 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadHistoryMaster(item)}
                              disabled={downloadingItems[item.id ?? 0]?.master}
                            >
                              {downloadingItems[item.id ?? 0]?.master ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="mr-2 h-4 w-4" />
                              )}
                              {downloadingItems[item.id ?? 0]?.master
                                ? "Downloading..."
                                : "Download Master"}
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              File Size
                            </p>
                            <p className="font-medium text-sm">
                              {formatFileSize(item.masterDocumentFileSize)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Type
                            </p>
                            <p className="font-medium text-sm">
                              {item.masterDocumentMimeType || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {item.changer && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Changed by:</span>
                      <span className="font-medium">
                        {item.changer.fullName}
                      </span>
                      <span className="text-muted-foreground">
                        ({item.changer.email})
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
