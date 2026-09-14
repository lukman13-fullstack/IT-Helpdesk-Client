import { getCategoryLabel } from "@/utils/categoryLabels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  FileText,
  Hash,
  Building2,
  User,
  Calendar,
  AlignLeft,
  Info,
  HardDrive,
  FileType,
  GitBranch,
  Download,
  Loader2,
  Maximize2,
  X,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { format } from "date-fns";
import type { DocumentDetail } from "@/services/api/types/documents.types";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DetailTabProps {
  documentDetail: DocumentDetail;
  handleDownloadMaster: () => void;
  downloadingMaster: boolean;
  pdfBlob: Blob | null;
  previewLoading: boolean;
  previewError: boolean;
  canDownload?: boolean;
}

export default function DetailTab({
  documentDetail,
  handleDownloadMaster,
  downloadingMaster,
  pdfBlob,
  previewLoading,
  previewError,
  canDownload = false,
}: DetailTabProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (size: number | undefined) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  OBSOLETE
                </Badge>
              </div>
              <CardTitle className="text-2xl">{documentDetail.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{documentDetail.documentCode}</Badge>
                {documentDetail.isInternal && (
                  <Badge variant="secondary">Internal</Badge>
                )}
              </div>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Hash className="h-4 w-4" />,
                label: "Document Number",
                value: documentDetail.documentNumber,
              },
              {
                icon: <FileText className="h-4 w-4" />,
                label: "Category",
                value: (
                  <span>
                    {getCategoryLabel(documentDetail.category)}
                  </span>
                ),
              },
              {
                icon: <Building2 className="h-4 w-4" />,
                label: "Department",
                value: `${documentDetail.department.name} (${documentDetail.department.departmentCode})`,
              },
              {
                icon: <User className="h-4 w-4" />,
                label: "Uploaded By",
                value: documentDetail.uploader.fullName,
              },
              {
                icon: <Calendar className="h-4 w-4" />,
                label: "Created At",
                value: formatDate(documentDetail.createdAt),
              },
              {
                icon: <Calendar className="h-4 w-4" />,
                label: "Updated At",
                value: formatDate(documentDetail.updatedAt),
              },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            {documentDetail.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" /> Description
                </p>
                <p className="text-sm text-muted-foreground">
                  {documentDetail.description}
                </p>
              </div>
            )}
          </div>

          {/* Conditional Fields Display */}
          {(documentDetail.documentFormat ||
            documentDetail.retentionPeriod ||
            documentDetail.storageLocation ||
            documentDetail.publishingInstitution ||
            documentDetail.dateOfIssue ||
            documentDetail.documentStoragePeriod) && (
            <>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" /> Additional Document Information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentDetail.documentFormat && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Document Format
                      </p>
                      <p className="font-medium capitalize">
                        {documentDetail.documentFormat.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                  {documentDetail.retentionPeriod && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Retention Period
                      </p>
                      <p className="font-medium">
                        {documentDetail.retentionPeriod} months
                      </p>
                    </div>
                  )}
                  {documentDetail.storageLocation && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Storage Location
                      </p>
                      <p className="font-medium">
                        {documentDetail.storageLocation}
                      </p>
                    </div>
                  )}
                  {documentDetail.publishingInstitution && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Publishing Institution
                      </p>
                      <p className="font-medium">
                        {documentDetail.publishingInstitution}
                      </p>
                    </div>
                  )}
                  {documentDetail.dateOfIssue && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Date of Issue
                      </p>
                      <p className="font-medium">
                        {formatDate(documentDetail.dateOfIssue)}
                      </p>
                    </div>
                  )}
                  {documentDetail.expiredDate && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Expired Date
                      </p>
                      <p className="font-medium">
                        {formatDate(documentDetail.expiredDate)}
                      </p>
                    </div>
                  )}
                  {documentDetail.documentStoragePeriod && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Document Storage Period
                      </p>
                      <p className="font-medium">
                        {documentDetail.documentStoragePeriod} months
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" /> File Information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <HardDrive className="h-4 w-4" />,
                  label: "File Size",
                  value: formatFileSize(documentDetail.fileSize),
                },
                {
                  icon: <FileType className="h-4 w-4" />,
                  label: "Type",
                  value: documentDetail.mimeType,
                },
                {
                  icon: <GitBranch className="h-4 w-4" />,
                  label: "Revision",
                  value: documentDetail.revision,
                },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {documentDetail.masterDocumentGoogleDriveId && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Raw Document Information
                  </p>
                  {canDownload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadMaster}
                      disabled={downloadingMaster}
                    >
                      {downloadingMaster ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {downloadingMaster
                        ? "Downloading..."
                        : "Download Raw Document"}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: <HardDrive className="h-4 w-4" />,
                      label: "File Size",
                      value: documentDetail.masterDocumentFileSize
                        ? formatFileSize(documentDetail.masterDocumentFileSize)
                        : "-",
                    },
                    {
                      icon: <FileType className="h-4 w-4" />,
                      label: "Type",
                      value: documentDetail.masterDocumentMimeType || "-",
                    },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* PDF Preview with OBSOLETE Watermark on Every Page */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Document Preview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRotateLeft} title="Rotate Left">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRotateRight} title="Rotate Right">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullScreen} className="ml-2">
                <Maximize2 className="mr-2 h-4 w-4" />
                Full Screen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading preview...
                </p>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">
                  Failed to load preview. Please try downloading the document.
                </p>
              </div>
            ) : (
              <div
                className="pdf-viewer-container max-h-[800px] overflow-auto border rounded-lg bg-gray-50 p-4"
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                {pdfBlob && (
                  <Document
                    file={pdfBlob}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    }
                    error={
                      <div className="text-red-500 text-center p-4">
                        Failed to load PDF.
                      </div>
                    }
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <div
                        key={`page_${index + 1}`}
                        className="mb-4 flex justify-center"
                      >
                        <Page
                          pageNumber={index + 1}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          width={800}
                          scale={scale}
                          rotate={rotation}
                          className="shadow-md"
                        />
                      </div>
                    ))}
                  </Document>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Preview Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 text-white">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Obsolete Document Preview - {documentDetail?.documentCode || "Document"}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out" className="text-white hover:bg-white/20">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In" className="text-white hover:bg-white/20">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRotateLeft} title="Rotate Left" className="text-white hover:bg-white/20">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRotateRight} title="Rotate Right" className="text-white hover:bg-white/20">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullScreen}
                className="text-white hover:bg-white/20 ml-2"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="mt-4 text-white">Loading preview...</p>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">
                  Failed to load preview. Please try downloading the document.
                </p>
              </div>
            ) : pdfBlob ? (
              <div 
                className="flex flex-col items-center"
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                <Document
                  file={pdfBlob}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  }
                  error={
                    <div className="text-red-500 text-center p-4">
                      Failed to load PDF.
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div key={`fullscreen_page_${index + 1}`} className="mb-6 flex justify-center">
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={Math.min(window.innerWidth - 100, 1200)}
                        scale={scale}
                        rotate={rotation}
                        className="shadow-2xl"
                      />
                    </div>
                  ))}
                </Document>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">No preview available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
