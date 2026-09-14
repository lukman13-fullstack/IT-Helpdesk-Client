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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/common/Pagination";
import {
  ArrowLeft,
  Eye,
  BookOpen,
  FileText,
  Calendar,
  Tag,
  Hash,
  Globe,
  Lock,
  Search as SearchIcon,
  Download,
  Loader2,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncGetSharedDocumentsActionCreator } from "@/store/documents/action";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState } from "react";
import { convertSnakeToReadable } from "@/lib/convertSnakeToReadable";
import ViewIndexDialog from "./ViewIndexDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import DocumentCategoryList from "@/pages/Documents/components/DocumentCategoryList";
import { useLanguage } from "@/context/LanguageContext";
import { downloadMasterDocument } from "@/services/api/documents";
import { notify } from "@/lib/toast";
import { Switch } from "@/components/ui/switch";
import { asyncToggleRawDownloadActionCreator } from "@/store/documents/action";

export default function DocumentSharedList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [downloadingDocs, setDownloadingDocs] = useState<Record<number, boolean>>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 100;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const { sharedDocuments: documents, pagination } = useAppSelector(
    (state) => state.documents
  );
  const user = useAppSelector((state: any) => state.authUser?.user);

  // Check if current user is a member of the document's department
  const checkIsDepartmentMember = (docDepartmentId: number | string | undefined) => {
    if (!docDepartmentId) return false;
    
    // user.departmentIds contains the array of department ID numbers
    return user?.departmentIds?.some((id: number | string) => String(id) === String(docDepartmentId));
  };

  useEffect(() => {
    if (id) {
      dispatch(asyncGetSharedDocumentsActionCreator(id, page, limit, search, category));
    }
  }, [dispatch, id, page, limit, search, category]);

  useEffect(() => {
    if (documents.length > 0) {
      const timer = setTimeout(() => setIsTableLoaded(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsTableLoaded(false);
    }
  }, [documents]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      prev.set("limit", String(newLimit));
      prev.set("page", "1");
      return prev;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(
      (prev) => {
        prev.set("search", e.target.value);
        prev.set("page", "1");
        return prev;
      },
      { replace: true }
    );
  };

  const toggleSort = () => {
    if (sortOrder === "none") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("none");
  };

  const sortedDocuments = [...documents].sort((a: any, b: any) => {
    if (sortOrder === "none") return 0;
    
    const extractNumber = (code: string) => {
      if (!code) return 0;
      const match = code.match(/(\d+)(?!.*\d)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const numA = extractNumber(a.documentCode);
    const numB = extractNumber(b.documentCode);

    if (sortOrder === "asc") return numA - numB;
    return numB - numA;
  });

  const handleDownloadMaster = async (id: number, name: string) => {
    try {
      setDownloadingDocs((prev) => ({ ...prev, [id]: true }));
      const { blob, filename } = await downloadMasterDocument(String(id), name);

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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download master document";
      notify.error(errorMessage);
    } finally {
      setDownloadingDocs((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleDownload = async (docId: number, currentStatus: boolean) => {
    try {
      await dispatch(asyncToggleRawDownloadActionCreator(docId, !currentStatus));
      // Refresh the list after toggle
      if (id) {
        dispatch(asyncGetSharedDocumentsActionCreator(id, page, limit, search, category));
      }
    } catch (error) {
      // Error handled by action creator
    }
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={() => navigate(-1)}
        className="group gap-2 px-0 text-slate-500 hover:text-primary transition-all duration-300"
        variant="ghost"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">{t("documentList.backToDepartments")}</span>
      </Button>

      <DocumentCategoryList />

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm ring-1 ring-black/[0.03] animate-fade-in-up">
        {/* Modern Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />

        <CardHeader className="pb-6 pt-6 font-modern">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                  {t("documentList.title")}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="opacity-70">{t("documentList.registry")}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span>{pagination?.total || 0} {t("documentList.totalRecords")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                <div className="relative flex-1 min-w-[200px]">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t("documentList.searchPlaceholder")}
                    className="pl-10 h-10 border-slate-200 bg-slate-50/50 text-sm rounded-xl focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <ViewIndexDialog
                  departmentId={id}
                  trigger={
                    <Button
                      variant="outline"
                      className="h-10 gap-2 border-primary/20 bg-primary/[0.02] text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("documentList.masterIndex")}</span>
                    </Button>
                  }
                />
              </div>
              <Button
                variant="ghost"
                onClick={toggleSort}
                className="h-7 gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg px-2"
              >
                {sortOrder === "none" && <ArrowUpDown className="h-3.5 w-3.5" />}
                {sortOrder === "asc" && <ArrowUpNarrowWide className="h-3.5 w-3.5 text-primary" />}
                {sortOrder === "desc" && <ArrowDownWideNarrow className="h-3.5 w-3.5 text-primary" />}
                Sort by Document Number {sortOrder !== "none" && `(${sortOrder.toUpperCase()})`}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 border-t border-slate-50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30 border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 pl-6">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {t("documentList.columns.name")}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      {t("documentList.columns.noDocument")}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      {t("documentList.columns.documentType")}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("documentList.columns.revision")}
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {t("documentList.columns.releaseDate")}
                    </div>
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Remark
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Raw Document
                  </TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right pr-6 sticky right-0 z-20">
                    {t("documentList.columns.action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDocuments.map((document: any, index: number) => (
                  <TableRow
                    key={document.id}
                    className={cn(
                      "group border-b border-slate-50 transition-all duration-300 hover:bg-primary/[0.01]",
                      isTableLoaded ? "animate-slide-in-right" : "opacity-0"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="max-w-[180px] truncate text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                          {document.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-mono text-[10px] text-slate-500">
                      <code className="rounded bg-slate-100 px-2 py-1 group-hover:bg-primary/5 group-hover:text-primary/70 transition-colors">
                        {document.documentCode}
                      </code>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="secondary"
                        className="rounded-lg border-0 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-400"
                      >
                        {convertSnakeToReadable(document.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-slate-200 text-slate-400"
                      >
                        v{document.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-[11px] font-semibold text-slate-400">
                      {new Date(document.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-4">
                      {document.isInternal ? (
                        <Badge className="gap-1 text-[9px] font-bold bg-blue-50 text-blue-600 border-0 hover:bg-blue-100 transition-colors">
                          <Lock className="h-2.5 w-2.5" />
                          {t("common.internal")}
                        </Badge>
                      ) : (
                        <Badge className="gap-1 text-[9px] font-bold bg-amber-50 text-amber-600 border-0 hover:bg-amber-100 transition-colors">
                          <Globe className="h-2.5 w-2.5" />
                          {t("documentControl.external")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-[11px] text-slate-400 max-w-[150px] truncate">
                      {document.remark || "—"}
                    </TableCell>
                    <TableCell className="py-4">
                      {document.category === "form" ? (
                        checkIsDepartmentMember(document.departmentId) ? (
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={document.isRawDownloadable}
                              onCheckedChange={() => handleToggleDownload(document.id, document.isRawDownloadable)}
                              className="data-[state=checked]:bg-primary"
                              title={document.isRawDownloadable ? "Disable Download" : "Enable Download"}
                            />
                            {(document.masterDocumentGoogleDriveId || document.masterDocumentPath) ? (
                              <Button
                                onClick={() => handleDownloadMaster(document.id, document.name)}
                                disabled={downloadingDocs[document.id]}
                                size="sm"
                                variant="outline"
                                className="h-8 gap-2 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                              >
                                {downloadingDocs[document.id] ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                                Download
                              </Button>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-bold">—</span>
                            )}
                          </div>
                        ) : (
                          document.isRawDownloadable && (document.masterDocumentGoogleDriveId || document.masterDocumentPath) ? (
                            <Button
                              onClick={() => handleDownloadMaster(document.id, document.name)}
                              disabled={downloadingDocs[document.id]}
                              size="sm"
                              variant="outline"
                              className="h-8 gap-2 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                              {downloadingDocs[document.id] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              Download
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400">
                              <Lock className="h-2.5 w-2.5 mr-1" />
                              Restricted
                            </Badge>
                          )
                        )
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right sticky right-0 z-10 bg-white group-hover:bg-slate-50 transition-colors shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.02)]">
                      <Button
                        onClick={() => navigate(`/shared-documents/detail/${document.id}`)}
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-40 text-center py-10">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <FileText className="h-10 w-10 opacity-10" />
                        <p className="text-sm font-medium">{t("documentList.noRecordsSearch")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
          <Separator orientation="vertical" className="h-3" />
          <span>{t("masterIndex.page")} {pagination?.page} {t("masterIndex.of")} {pagination?.totalPages}</span>
        </div>
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
