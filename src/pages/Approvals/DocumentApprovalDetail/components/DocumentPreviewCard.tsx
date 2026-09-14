import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, Maximize2, X, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page } from "react-pdf";
import { useState } from "react";

interface DocumentPreviewCardProps {
  documentName: string;
  loading: boolean;
  error: boolean;
  pdfBlob: Blob | null;
  numPages: number | null;
  isFullScreen: boolean;
  onLoadSuccess: (data: { numPages: number }) => void;
  onToggleFullScreen: () => void;
  onRetry: () => void;
}

export function DocumentPreviewCard({
  documentName,
  loading,
  error,
  pdfBlob,
  numPages,
  isFullScreen,
  onLoadSuccess,
  onToggleFullScreen,
  onRetry,
}: DocumentPreviewCardProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  // Full Screen Modal Content
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 text-white">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Document Preview - {documentName || "Document"}
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
                onClick={onToggleFullScreen}
                className="text-white hover:bg-white/20 ml-2"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="mt-4 text-white">Loading preview...</p>
              </div>
            )}
            
            {!loading && error && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">
                  Failed to load preview. Please try again.
                </p>
                <Button variant="outline" className="mt-4" onClick={onRetry}>Retry</Button>
              </div>
            )}
            
            {!loading && !error && pdfBlob && (
              <div 
                className="flex flex-col items-center"
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                <Document
                  file={pdfBlob}
                  onLoadSuccess={onLoadSuccess}
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
            )}
            
            {!loading && !error && !pdfBlob && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-white text-lg">No preview available</p>
              </div>
            )}
          </div>
        </div>
    );
  }

  // Card Content
  return (
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
            <Button variant="outline" size="sm" onClick={onToggleFullScreen} className="ml-2">
              <Maximize2 className="mr-2 h-4 w-4" />
              Full Screen
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading preview...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">
                Failed to load preview. Please try again later.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={onRetry}
              >
                Retry
              </Button>
            </div>
          ) : pdfBlob ? (
            <div
              className="max-h-[600px] overflow-auto border rounded-lg bg-gray-50 p-4"
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            >
              <Document
                file={pdfBlob}
                onLoadSuccess={onLoadSuccess}
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
                      width={700}
                      scale={scale}
                      rotate={rotation}
                      className="shadow-md"
                    />
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
