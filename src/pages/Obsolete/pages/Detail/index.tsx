import Layout from "@/components/layout/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import {
  getObsoleteDocumentById,
  downloadObsoleteDocument,
  downloadObsoleteMasterDocument,
  getObsoleteDocumentPreview,
} from "@/services/api/documents";
import { useState, useEffect, useMemo } from "react";
import { notify } from "@/lib/toast";
import type { DocumentDetail } from "@/services/api/types/documents.types";
import DetailTab from "./DetailTab";
import HistoryTab from "./HistoryTab";
import PrintHistoryTab from "./PrintHistoryTab";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function ObsoleteDocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingMaster, setDownloadingMaster] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Get user from Redux
  const { user } = useAppSelector((state) => state.authUser);
  
  // Check if user has DOWNLOAD_OBSOLETE_DOCUMENTS permission
  const canDownload = useMemo(() => {
    if (!user?.role?.permissions) return false;
    return user.role.permissions.some(
      (p: any) => p.permission?.name === "DOWNLOAD_OBSOLETE_DOCUMENTS"
    );
  }, [user]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getObsoleteDocumentById(id);
        setDocumentDetail(data);
      } catch (error) {
        console.error("Failed to fetch obsolete document:", error);
        notify.error("Failed to load document details");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  useEffect(() => {
    const fetchPreview = async () => {
      // All users can view preview
      if (!id) return;
      
      try {
        setPreviewLoading(true);
        const blob = await getObsoleteDocumentPreview(id);
        setPdfBlob(blob);
        setPreviewError(false);
      } catch (err) {
        console.error("Failed to fetch preview:", err);
        setPreviewError(true);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;

    try {
      setDownloading(true);
      const { blob, filename } = await downloadObsoleteDocument(
        id,
        documentDetail?.name || ""
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
      setDownloading(false);
    }
  };

  const handleDownloadMaster = async () => {
    if (!id) return;

    try {
      setDownloadingMaster(true);
      const { blob, filename } = await downloadObsoleteMasterDocument(
        id,
        documentDetail?.name || ""
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
      setDownloadingMaster(false);
    }
  };

  const handleCancel = () => {
    navigate("/obsolete-documents");
  };

  if (loading && !documentDetail) {
    return (
      <Layout title="Obsolete Document Detail">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!documentDetail) {
    return (
      <Layout title="Obsolete Document Detail">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Document not found</p>
            <Button
              onClick={() => handleCancel()}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Obsolete Documents
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title="Obsolete Document Detail"
      items={[
        {
          label: "Obsolete Documents",
          href: "/obsolete-documents",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Obsolete Documents
          </Button>
          {/* Download buttons - only for users with DOWNLOAD_OBSOLETE_DOCUMENTS permission */}
          {canDownload && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {downloading ? "Downloading..." : "Download Document"}
              </Button>
              {documentDetail.masterDocumentGoogleDriveId && (
                <Button
                  variant="outline"
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
                    : "Download Master Document"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* All users can see preview tabs */}
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="print-history">Print History</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6">
            <DetailTab
              documentDetail={documentDetail}
              handleDownloadMaster={handleDownloadMaster}
              downloadingMaster={downloadingMaster}
              pdfBlob={pdfBlob}
              previewLoading={previewLoading}
              previewError={previewError}
              canDownload={canDownload}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab canDownload={canDownload} />
          </TabsContent>

          <TabsContent value="print-history" className="mt-6">
            <PrintHistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
