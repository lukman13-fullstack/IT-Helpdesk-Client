import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import DocumentCategoryList from "./components/DocumentCategoryList";
import { motion } from "framer-motion";
import DocumentHeader from "./components/DocumentHeader";
import DocumentList from "./components/DocumentList";
import { asyncGetDocumentsActionCreator } from "@/store/documents/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useSearchParams } from "react-router-dom";
import type { DocumentCategory, GetDocumentsParams, DocumentStatus } from "@/services/api/types/documents.types";
import { useLanguage } from "@/context/LanguageContext";

const isValidCategory = (value: string | null): value is DocumentCategory => {
  if (!value) return true;
  const validCategories: DocumentCategory[] = [
    "form",
    "standard",
    "instruksi_kerja",
    "prosedur",
    "manual_perusahaan",
    "manual_halal",
    "external",
    "",
  ];
  return validCategories.includes(value as DocumentCategory);
};

export default function Documents() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { documents, pagination } = useAppSelector((state) => state.documents);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const status = searchParams.get("status");
  const destinationParam = searchParams.get("destination");

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

  const handleStatusToggle = (value: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
      return params;
    });
  };

  const handleDestinationChange = (value: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value && value !== "All") {
        params.set("destination", value);
      } else {
        params.delete("destination");
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
    const validatedCategory = isValidCategory(category) ? category : undefined;
    
    // Requirement: For specific categories, ONLY show approved documents.
    // For "All Documents" (empty category), show everything (unless filtered manually).
    const isSpecificCategory = validatedCategory && validatedCategory.length > 0;
    
    // If specific category is selected, force status to 'approved'.
    // Otherwise, respect the URL param 'status' (which controls the dropdown).
    const finalStatus: DocumentStatus | undefined = isSpecificCategory ? "approved" : (status === "approved" ? "approved" : undefined);

    const params: GetDocumentsParams = {
      search,
      page,
      limit,
      status: finalStatus,
      category: validatedCategory,
    };

    if (destinationParam) {
      params.destination = destinationParam;
    }

    dispatch(asyncGetDocumentsActionCreator(params));
  }, [dispatch, search, page, limit, category, status, destinationParam]);

  return (
    <Layout title={t("documentControl.title")} items={[{ label: t("common.home"), href: "/" }]}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6"
      >
        <DocumentHeader />
        <DocumentCategoryList />
        <DocumentList
          status={status}
          destination={destinationParam}
          documents={documents}
          pagination={pagination}
          handleSearchChange={handleSearchChange}
          handleStatusChange={handleStatusToggle}
          handleDestinationChange={handleDestinationChange}
          search={searchQuery}
          handlePageChange={handlePageChange}
          handleLimitChange={handleLimitChange}
        />
      </motion.div>
    </Layout>
  );
}
