import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Layout from "@/components/layout/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, CheckCircle, XCircle, Download } from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import {
  asyncGetReferencesActionCreator,
  asyncDeleteReferenceActionCreator,
} from "@/store/references/action";
import Pagination from "@/components/common/Pagination";
import Search from "@/components/common/Search";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { useLanguage } from "@/context/LanguageContext";
import { exportToExcel } from "@/utils/exportToExcel";
export default function References() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { references, pagination, loading } = useSelector(
    (state: RootState) => state.references
  );

  useEffect(() => {
    dispatch(asyncGetReferencesActionCreator({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open);
  };

  const handleDeleteIdChange = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteReference = () => {
    if (deleteId) {
      dispatch(asyncDeleteReferenceActionCreator(deleteId))
        .then(() => {
          setDeleteOpen(false);
          dispatch(asyncGetReferencesActionCreator({ page, limit, search }));
        })
        .catch(() => {
          // Error is handled in action
        });
    }
  };

  const handleExportExcel = () => {
    const dataToExport = references.map((ref, index) => ({
      no: (page - 1) * limit + index + 1,
      code: ref.code,
      name: ref.name,
      description: ref.description || "-",
      checker: ref.checker ? ref.checker.fullName : "-",
      status: ref.isActive ? t("references.status.active") : t("references.status.inactive"),
      documents: ref._count?.documents || 0,
    }));

    const columns = [
      { header: "No", key: "no", width: 10 },
      { header: t("references.columns.code"), key: "code", width: 20 },
      { header: t("references.columns.name"), key: "name", width: 30 },
      { header: t("references.columns.description"), key: "description", width: 40 },
      { header: t("references.columns.checker"), key: "checker", width: 30 },
      { header: t("references.columns.status"), key: "status", width: 15 },
      { header: t("references.columns.documents"), key: "documents", width: 15 },
    ];

    exportToExcel(dataToExport, columns, "References");
  };

  return (
    <Layout title={t("sidebar.references")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("references.management")}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={handleExportExcel}
              disabled={references.length === 0}
            >
              <Download className="mr-2 w-4 h-4" />
              Export Excel
            </Button>
            <Button onClick={() => navigate("/references/create")}>
              <Plus className="mr-2 h-4 w-4" />
              {t("references.addReference")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Search
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("references.search")}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("references.columns.code")}</TableHead>
                  <TableHead>{t("references.columns.name")}</TableHead>
                  <TableHead>{t("references.columns.description")}</TableHead>
                  <TableHead>{t("references.columns.checker")}</TableHead>
                  <TableHead className="text-center">{t("references.columns.status")}</TableHead>
                  <TableHead className="text-center">{t("references.columns.documents")}</TableHead>
                  <TableHead className="text-right">{t("references.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {t("references.loading")}
                    </TableCell>
                  </TableRow>
                ) : references.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {t("references.noReferences")}
                    </TableCell>
                  </TableRow>
                ) : (
                  references.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-mono font-medium">
                        {ref.code}
                      </TableCell>
                      <TableCell className="font-medium">{ref.name}</TableCell>
                      <TableCell>
                        {ref.description || (
                          <span className="text-muted-foreground italic">
                            {t("references.noDescription")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ref.checker ? (
                          ref.checker.fullName
                        ) : (
                          <span className="text-muted-foreground italic">
                            {t("references.notAssigned")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {ref.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t("references.status.active")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            {t("references.status.inactive")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {ref._count?.documents || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="text-blue-500 hover:text-blue-500"
                            title={t("references.actions.edit")}
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              navigate(`/references/update/${ref.id}`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            className="text-red-500 hover:text-red-500"
                            title={t("references.actions.delete")}
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteIdChange(ref.id)}
                            disabled={
                              ref._count && ref._count.documents > 0
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {pagination && (
        <div className="mt-4 flex justify-end">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            limit={limit}
            limitChange={handleLimitChange}
          />
        </div>
      )}
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={handleDeleteOpenChange}
        onYes={handleDeleteReference}
        title={t("references.deleteConfirm.title")}
        description={t("references.deleteConfirm.description")}
        yesText={t("references.deleteConfirm.yes")}
        noText={t("references.deleteConfirm.no")}
      />
    </Layout>
  );
}
