import Layout from "@/components/layout/layout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState, useMemo } from "react";
import { asyncGetObsoleteDocumentsActionCreator } from "@/store/documents/action";
import { useSearchParams } from "react-router-dom";
import ObsoleteDocumentList from "./components/ObsoleteDocumentList";
import { useLanguage } from "@/context/LanguageContext";

export default function Obsolete() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { obsoleteDocuments, obsoletePagination } = useAppSelector(
    (state) => state.documents
  );
  const authUser = useAppSelector((state) => state.authUser.user);

  const canDownload = useMemo(() => {
    if (!authUser?.role?.permissions) return false;
    return authUser.role.permissions.some(
      (p: any) => p.permission?.name === "DOWNLOAD_OBSOLETE_DOCUMENTS"
    );
  }, [authUser]);

  const canDelete = useMemo(() => {
    if (!authUser?.role?.permissions) return false;
    return authUser.role.permissions.some(
      (p: any) => p.permission?.name === "DELETE_DOCUMENT"
    );
  }, [authUser]);

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearchQuery(newSearch);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      return params;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage.toString());
      return params;
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("limit", newLimit.toString());
      params.set("page", "1");
      return params;
    });
  };

  const fetchDocuments = () => {
    dispatch(
      asyncGetObsoleteDocumentsActionCreator({
        search,
        page,
        limit,
      })
    );
  };

  useEffect(() => {
    fetchDocuments();
  }, [dispatch, search, page, limit]);

  return (
    <Layout title={t("sidebar.obsoleteDocuments")} items={[{ label: t("common.home"), href: "/" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.obsoleteDocuments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ObsoleteDocumentList
            documents={obsoleteDocuments}
            pagination={obsoletePagination}
            handleSearchChange={handleSearchChange}
            search={searchQuery}
            handlePageChange={handlePageChange}
            handleLimitChange={handleLimitChange}
            canDownload={canDownload}
            canDelete={canDelete}
            onDeleteSuccess={fetchDocuments}
          />
        </CardContent>
      </Card>
      </motion.div>
    </Layout>
  );
}
