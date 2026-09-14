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
import type { RootState, AppDispatch } from "@/store";
import PaginationComponent from "../../components/common/Pagination";
import { Edit, Eye, Key, Trash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Search from "@/components/common/Search";
import { Link, useNavigate } from "react-router-dom";
import { AsyncGetUserDetailActionCreator } from "@/store/users/action";
import { AsyncGetAllUsersActionCreator } from "@/store/users/action";
import { AsyncDeleteUserActionCreator } from "@/store/users/action";
import ConfirmDialog from "@/components/common/confirm-dialog";
import ResetPassword from "./components/reset-password";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { exportToExcel } from "@/utils/exportToExcel";

export default function Users() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, pagination, loading } = useSelector(
    (state: RootState) => state.users
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [id, setId] = useState<number | string>("");
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search");

  useEffect(() => {
    dispatch(
      AsyncGetAllUsersActionCreator(currentPage, limit, searchQuery) as any
    );
  }, [dispatch, currentPage, limit, searchQuery]);

  useEffect(() => {
    setSearchQuery(search || "");
  }, [search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleUpdateUser = (id: number) => {
    dispatch(AsyncGetUserDetailActionCreator(id));
    navigate(`/users/update/${id}`);
  };

  const handleViewUser = (id: number) => {
    dispatch(AsyncGetUserDetailActionCreator(id));
    navigate(`/users/detail/${id}`);
  };

  const handleDeleteUser = () => {
    dispatch(AsyncDeleteUserActionCreator(id));
    setOpen(false);
    setId("");
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleDeleteIdChange = (id: number | string) => {
    setId(id);
  };

  const handleResetPasswordOpenChange = (open: boolean) => {
    setOpenResetPassword(open);
  };

  const handleResetPasswordIdChange = (id: number | string) => {
    setId(id);
  };

  const handleExportExcel = () => {
    const dataToExport = users.map((user: any, index: number) => ({
      no: (currentPage - 1) * limit + index + 1,
      fullName: user.fullName,
      position: user.position || "-",
      email: user.email,
      role: user.role.name,
    }));

    const columns = [
      { header: t("users.columns.no"), key: "no", width: 10 },
      { header: t("users.columns.fullName"), key: "fullName", width: 30 },
      { header: t("users.columns.position"), key: "position", width: 20 },
      { header: t("users.columns.email"), key: "email", width: 30 },
      { header: t("users.columns.role"), key: "role", width: 20 },
    ];

    exportToExcel(dataToExport, columns, "Users");
  };

  return (
    <Layout title={t("sidebar.users")} items={[{ label: t("common.home"), href: "/" }]}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-4"
      >
        <Card className="p-5">
          <CardHeader>
            <CardTitle>{t("sidebar.users")}</CardTitle>
            <CardDescription>{t("users.description")}</CardDescription>
            <div className="flex items-center gap-2 justify-between">
              <Search
                value={searchQuery}
                onChange={(e) => setSearchParams({ search: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={handleExportExcel}
                  disabled={users.length === 0}
                >
                  <Download className="mr-2 w-4 h-4" />
                  Export Excel
                </Button>
                <Link to="/users/create">
                  <Button variant="success">{t("users.addUser")}</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">{t("users.loading")}</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {t("users.noUsers")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-primary text-primary-foreground rounded-tl-md">
                      {t("users.columns.no")}
                    </TableHead>
                    <TableHead className="bg-primary text-primary-foreground">
                      {t("users.columns.fullName")}
                    </TableHead>
                    <TableHead className="bg-primary text-primary-foreground">
                      {t("users.columns.position")}
                    </TableHead>
                    <TableHead className="bg-primary text-primary-foreground">
                      {t("users.columns.email")}
                    </TableHead>
                    <TableHead className="bg-primary text-primary-foreground">
                      {t("users.columns.role")}
                    </TableHead>
                    <TableHead className="bg-primary w-1/12 text-primary-foreground rounded-tr-md">
                      {t("users.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="border-1 border-muted">
                  {users.map((user: any, index: number) => (
                    <TableRow key={user.id} className="border-b border-muted">
                      <TableCell className="font-medium">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.position || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center justify-center">
                          <Button
                            onClick={() => handleViewUser(user.id)}
                            size="icon"
                            variant="outline"
                            className="text-primary bg-transparent hover:bg-primary hover:text-white"
                            title={t("users.actions.view")}
                          >
                            <Eye className="w-2 h-2" />
                          </Button>
                          <Button
                            onClick={() => handleUpdateUser(user.id)}
                            size="icon"
                            variant="outline"
                            className="text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white"
                            title={t("users.actions.update")}
                          >
                            <Edit className="w-2 h-2" />
                          </Button>
                          <Button
                            onClick={() => {
                              handleResetPasswordIdChange(user.id);
                              handleResetPasswordOpenChange(true);
                            }}
                            size="icon"
                            variant="outline"
                            className="text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white"
                            title={t("users.actions.changePassword")}
                          >
                            <Key className="w-2 h-2" />
                          </Button>
                          <Button
                            onClick={() => {
                              handleDeleteIdChange(user.id);
                              handleDeleteOpenChange(true);
                            }}
                            size="icon"
                            variant="outline"
                            className="text-red-600 bg-transparent hover:bg-red-600 hover:text-white"
                            title={t("users.actions.delete")}
                          >
                            <Trash className="w-2 h-2" />
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
          {pagination && pagination.totalPages > 0 && (
            <PaginationComponent
              limit={limit}
              limitChange={handleLimitChange}
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
        <ConfirmDialog
          open={open}
          onOpenChange={handleDeleteOpenChange}
          title={t("users.deleteConfirm.title")}
          description={t("users.deleteConfirm.description")}
          yesText={t("users.deleteConfirm.yes")}
          noText={t("users.deleteConfirm.no")}
          onYes={() => handleDeleteUser()}
        />
        <ResetPassword
          id={id}
          isOpen={openResetPassword}
          onOpenChange={handleResetPasswordOpenChange}
        />
      </motion.div>
    </Layout>
  );
}
