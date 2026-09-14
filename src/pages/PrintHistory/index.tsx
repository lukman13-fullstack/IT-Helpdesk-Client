import Layout from "@/components/layout/layout";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState } from "react";
import { asyncGetAllPrintHistoryActionCreator } from "@/store/printRequests/action";
import { useSearchParams } from "react-router-dom";
import PrintHistoryList from "./components/PrintHistoryList";
import { useLanguage } from "@/context/LanguageContext";

export default function PrintHistory() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const { allPrintHistory, allPrintPagination, loading } = useAppSelector(
    (state) => state.printRequests
  );

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const status = searchParams.get("status") || "all";
  const distribution = searchParams.get("distribution") || "all";

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

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
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

  useEffect(() => {
    dispatch(
      asyncGetAllPrintHistoryActionCreator({
        search,
        page,
        limit,
        status,
        distribution,
      })
    );
  }, [dispatch, search, page, limit, status, distribution]);

  return (
    <Layout title={t("sidebar.printHistory")} items={[{ label: t("common.home"), href: "/" }]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.printHistory")}</CardTitle>
          <CardDescription>
            {t("printHistory.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrintHistoryList
            requests={allPrintHistory || []}
            pagination={allPrintPagination || { page: 1, limit: 100, total: 0, totalPages: 0 }}
            handleSearchChange={handleSearchChange}
            search={searchQuery}
            handlePageChange={handlePageChange}
            handleLimitChange={handleLimitChange}
            status={status}
            distribution={distribution}
            onFilterChange={handleFilterChange}
            loading={loading}
          />
        </CardContent>
      </Card>
      </motion.div>
    </Layout>
  );
}
