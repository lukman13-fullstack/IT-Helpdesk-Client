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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  asyncDeleteDepartmentActionCreator,
  asyncGetDepartmentsActionCreator,
} from "@/store/departments/action";
import type { RootState, AppDispatch } from "@/store";
import PaginationComponent from "../../components/common/Pagination";
import { Edit, Eye, Plus, Trash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Search from "../../components/common/Search";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/common/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { exportToExcel } from "@/utils/exportToExcel";
export default function Departments() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { departments, pagination, loading } = useSelector(
    (state: RootState) => state.departments
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number>("");

  useEffect(() => {
    dispatch(
      asyncGetDepartmentsActionCreator(currentPage, limit, searchQuery) as any
    );
  }, [dispatch, currentPage, limit, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open);
  };

  const handleDeleteIdChange = (id: string | number | undefined) => {
    setDeleteId(id || "");
  };

  const handleDeleteDepartment = () => {
    dispatch(asyncDeleteDepartmentActionCreator(deleteId) as any);
    handleDeleteOpenChange(false);
  };

  const handleExportExcel = () => {
    const dataToExport = departments.map((dept, index) => ({
      no: (currentPage - 1) * limit + index + 1,
      name: dept.name,
      code: dept.departmentCode || "-",
      description: dept.description || "-",
      usersCount: dept._count?.users ?? 0,
      status: dept.status === "active" ? t("departments.status.active") : t("departments.status.draft"),
    }));

    const columns = [
      { header: t("departments.columns.no"), key: "no", width: 10 },
      { header: t("departments.columns.departmentName"), key: "name", width: 30 },
      { header: t("departments.columns.departmentCode"), key: "code", width: 20 },
      { header: t("departments.columns.description"), key: "description", width: 40 },
      { header: t("departments.columns.usersCount"), key: "usersCount", width: 15 },
      { header: t("departments.columns.status"), key: "status", width: 15 },
    ];

    exportToExcel(dataToExport, columns, "Departments");
  };

  return (
    <Layout title={t("sidebar.departments")} items={[{ label: t("common.home"), href: "/" }]}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-4"
      >
        <Card className="p-5">
          <CardHeader>
            <CardTitle>{t("sidebar.departments")}</CardTitle>
            <CardDescription>
              {t("departments.description")}
            </CardDescription>
            <div className="flex justify-between">
              <Search
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={handleExportExcel}
                  disabled={departments.length === 0}
                >
                  <Download className="mr-2 w-4 h-4" />
                  Export Excel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all"
                  onClick={() => navigate("/departments/create")}
                >
                  <Plus className="mr-2 w-4 h-4" />
                  {t("departments.addDepartment")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">{t("departments.loading")}</div>
            ) : departments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {t("departments.noDepartments")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground rounded-tl-lg">
                      {t("departments.columns.no")}
                    </TableHead>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground">
                      {t("departments.columns.departmentName")}
                    </TableHead>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground">
                      {t("departments.columns.departmentCode")}
                    </TableHead>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground">
                      {t("departments.columns.description")}
                    </TableHead>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground">
                      {t("departments.columns.usersCount")}
                    </TableHead>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground">
                      {t("departments.columns.status")}
                    </TableHead>
                    <TableHead className="bg-muted/50 font-semibold text-muted-foreground rounded-tr-lg w-1/12 text-center">
                      {t("departments.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="border-1 border-muted">
                  {departments.map((department, index) => (
                    <TableRow
                      key={department.id}
                      className="border-b border-muted"
                    >
                      <TableCell>
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>{department.departmentCode || "-"}</TableCell>
                      <TableCell>{department.description || "-"}</TableCell>
                      <TableCell>{department._count?.users ?? 0}</TableCell>
                      <TableCell>
                        {department.status === "active" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                            {t("departments.status.active")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                            {t("departments.status.draft")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center justify-center">
                          <Button
                            onClick={() =>
                              navigate(`/department-detail/${department.id}`)
                            }
                            size="icon"
                            variant="ghost"
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 w-8"
                            title={t("departments.actions.view")}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              navigate(`/departments/update/${department.id}`)
                            }
                            size="icon"
                            variant="ghost"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                            title={t("departments.actions.update")}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                            onClick={() => {
                              handleDeleteOpenChange(true);
                              handleDeleteIdChange(department.id);
                            }}
                            title={t("departments.actions.delete")}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end">
          {pagination && pagination.total > 0 && (
            <PaginationComponent
              limit={limit}
              limitChange={handleLimitChange}
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={handleDeleteOpenChange}
        title={t("departments.deleteConfirm.title")}
        description={t("departments.deleteConfirm.description")}
        yesText={t("departments.deleteConfirm.yes")}
        noText={t("departments.deleteConfirm.no")}
        onYes={() => handleDeleteDepartment()}
      />
    </Layout>
  );
}
