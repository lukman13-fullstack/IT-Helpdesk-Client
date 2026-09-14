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
import { Eye, Pencil, Trash2, Plus, Download } from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import {
  asyncGetRolesActionCreator,
  asyncDeleteRoleActionCreator,
} from "@/store/roles/action";
import Pagination from "@/components/common/Pagination";
import Search from "../../components/common/Search";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/common/confirm-dialog";
import { useLanguage } from "@/context/LanguageContext";
import { exportToExcel } from "@/utils/exportToExcel";
export default function Roles() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | string | undefined>(
    undefined
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { roles, pagination, loading } = useSelector(
    (state: RootState) => state.roles
  );

  useEffect(() => {
    dispatch(asyncGetRolesActionCreator({ page, limit, search }));
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

  const handleDeleteIdChange = (id: string | number | undefined) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteRole = () => {
    if (deleteId) {
      dispatch(asyncDeleteRoleActionCreator(deleteId)).then(() => {
        setDeleteOpen(false);
        dispatch(asyncGetRolesActionCreator({ page, limit, search }));
      });
    }
  };

  const handleExportExcel = () => {
    const dataToExport = roles.map((role, index) => ({
      no: (page - 1) * limit + index + 1,
      name: role.name,
      description: role.description || "-",
      permissions: role._count?.permissions || 0,
      users: role._count?.users || 0,
    }));

    const columns = [
      { header: "No", key: "no", width: 10 },
      { header: t("roles.columns.name"), key: "name", width: 30 },
      { header: t("roles.columns.description"), key: "description", width: 40 },
      { header: t("roles.columns.permissions"), key: "permissions", width: 15 },
      { header: t("roles.columns.users"), key: "users", width: 15 },
    ];

    exportToExcel(dataToExport, columns, "Roles");
  };

  return (
    <Layout title={t("sidebar.roles")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("roles.management")}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={handleExportExcel}
              disabled={roles.length === 0}
            >
              <Download className="mr-2 w-4 h-4" />
              Export Excel
            </Button>
            <Button onClick={() => navigate("/roles/create")}>
              <Plus className="mr-2 h-4 w-4" />
              {t("roles.addRole")}
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
              placeholder={t("roles.search")}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("roles.columns.name")}</TableHead>
                  <TableHead>{t("roles.columns.description")}</TableHead>
                  <TableHead className="text-center">{t("roles.columns.permissions")}</TableHead>
                  <TableHead className="text-center">{t("roles.columns.users")}</TableHead>
                  <TableHead className="text-right">{t("roles.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {t("roles.loading")}
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {t("roles.noRoles")}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        {role.description || (
                          <span className="text-muted-foreground italic">
                            {t("roles.noDescription")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {role._count?.permissions || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {role._count?.users || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            title={t("roles.actions.view")}
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/roles/detail/${role.id}`)}
                          >
                            <Eye className="h-4 w-4 " />
                          </Button>
                          <Button
                            className="text-blue-500 hover:text-blue-500"
                            title={t("roles.actions.edit")}
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/roles/update/${role.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            className="text-red-500 hover:text-red-500"
                            title={t("roles.actions.delete")}
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteIdChange(role.id)}
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
        onYes={handleDeleteRole}
        title={t("roles.deleteConfirm.title")}
        description={t("roles.deleteConfirm.description")}
        yesText={t("roles.deleteConfirm.yes")}
        noText={t("roles.deleteConfirm.no")}
      />
    </Layout>
  );
}
