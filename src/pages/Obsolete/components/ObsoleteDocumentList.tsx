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
  CardTitle,
  Card,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Pagination } from "@/services/api/types/documents.types";
import { Document } from "@/services/api/types/documents.types";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/common/Pagination";
import { Eye, Download, Trash2 } from "lucide-react";
import Search from "@/components/common/Search";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  downloadObsoleteDocument,
  downloadObsoleteMasterDocument,
  forceDeleteObsoleteDocument,
} from "@/services/api/documents";
import { useState } from "react";
import { notify } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function getCategoryBadge(category: string) {
  const categoryMap: Record<string, { label: string; className: string }> = {
    form: { label: "Form", className: "bg-blue-100 text-blue-800" },
    standard: { label: "Standard", className: "bg-purple-100 text-purple-800" },
    instruksi_kerja: {
      label: "Work Instructions",
      className: "bg-green-100 text-green-800",
    },
    prosedur: { label: "Prosedur", className: "bg-orange-100 text-orange-800" },
    manual_perusahaan: {
      label: "Manual Company",
      className: "bg-pink-100 text-pink-800",
    },
    manual_halal: {
      label: "Manual Halal",
      className: "bg-teal-100 text-teal-800",
    },
  };

  const config = categoryMap[category] || {
    label: category,
    className: "bg-gray-100 text-gray-800",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}

export default function ObsoleteDocumentList({
  documents,
  pagination,
  handlePageChange,
  handleLimitChange,
  handleSearchChange,
  search,
  canDownload = false,
  canDelete = false,
  onDeleteSuccess,
}: {
  documents: Document[];
  pagination: Pagination;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  canDownload?: boolean;
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [downloadingItems, setDownloadingItems] = useState<{
    [key: number]: { doc: boolean; master: boolean };
  }>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleForceDelete = async (doc: Document) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete the obsolete document "${doc.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(doc.id);
      await forceDeleteObsoleteDocument(doc.id);
      notify.success("Document permanently deleted");
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error: any) {
      console.error("Force delete failed:", error);
      notify.error(error.message || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [doc.id]: { ...prev[doc.id], doc: true },
      }));

      const { blob, filename } = await downloadObsoleteDocument(
        doc.id,
        doc.name
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
        [doc.id]: { ...prev[doc.id], doc: false },
      }));
    }
  };

  const handleDownloadMaster = async (doc: Document) => {
    try {
      setDownloadingItems((prev) => ({
        ...prev,
        [doc.id]: { ...prev[doc.id], master: true },
      }));

      const { blob, filename } = await downloadObsoleteMasterDocument(
        doc.id,
        doc.name
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
        [doc.id]: { ...prev[doc.id], master: false },
      }));
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.obsoleteDocuments")}</CardTitle>
          <CardDescription>
            {t("obsolete.description")}
          </CardDescription>
          <div className="flex justify-between items-center gap-4">
            <Search value={search} onChange={handleSearchChange} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-primary text-primary-foreground rounded-tl-md">
                  {t("obsolete.columns.name")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("obsolete.columns.documentCode")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("obsolete.columns.revision")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("obsolete.columns.category")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("obsolete.columns.deleteReason")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("obsolete.columns.department")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground">
                  {t("obsolete.columns.releaseDate")}
                </TableHead>
                <TableHead className="bg-primary text-primary-foreground rounded-tr-md sticky right-0 z-20">
                  {t("obsolete.columns.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-1 border-muted">
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="border-b border-muted min-w-[250px] max-w-[250px] md:max-w-[300px] lg:max-w-[400px] whitespace-normal break-words">
                    {document.name}
                  </TableCell>
                  <TableCell>{document.documentCode}</TableCell>
                  <TableCell>{document.revision}</TableCell>
                  <TableCell>{getCategoryBadge(document.category)}</TableCell>
                  <TableCell>{document.deletionReason}</TableCell>
                  <TableCell>{document.department?.name || "-"}</TableCell>
                  <TableCell>
                    {document.releaseDate
                      ? new Date(document.releaseDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-white border-l border-muted">
                    <div className="flex gap-2 items-center justify-center">
                      <Button
                        onClick={() =>
                          navigate(`/obsolete-documents/${document.id}`)
                        }
                        size="icon"
                        variant="outline"
                        className="text-primary hover:bg-primary hover:text-primary"
                        title={t("obsolete.viewDocument")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* Download buttons - only for users with DOWNLOAD_OBSOLETE_DOCUMENTS permission */}
                      {canDownload && (
                        <Button
                          onClick={() => handleDownloadDocument(document)}
                          size="icon"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-500 hover:text-blue-500"
                          title={t("obsolete.downloadDocument")}
                          disabled={downloadingItems[document.id]?.doc}
                        >
                          {downloadingItems[document.id]?.doc ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {canDownload && document.masterDocumentGoogleDriveId && (
                        <Button
                          onClick={() => handleDownloadMaster(document)}
                          size="icon"
                          variant="outline"
                          className="text-green-600 hover:bg-green-500 hover:text-green-500"
                          title={t("obsolete.downloadMasterDocument")}
                          disabled={downloadingItems[document.id]?.master}
                        >
                          {downloadingItems[document.id]?.master ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          onClick={() => handleForceDelete(document)}
                          size="icon"
                          variant="outline"
                          className="text-red-600 hover:bg-red-500 hover:text-white"
                          title="Permanently Delete Document"
                          disabled={deletingId === document.id}
                        >
                          {deletingId === document.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-end py-5">
        <PaginationComponent
          limit={pagination.limit}
          limitChange={handleLimitChange}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
