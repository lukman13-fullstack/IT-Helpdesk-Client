import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, ChevronLeft, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { motion } from "framer-motion";

import { getMasterDocumentIndex } from "@/services/api/documents";
import type { MasterDocumentIndex } from "@/services/api/types/documents.types";
import ArtienceLogo from "@/assets/artience.png";
import { exportMasterIndexToExcel } from "@/lib/excelExport";
import { useLanguage } from "@/context/LanguageContext";

export default function MasterIndex() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const componentRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  const departmentId = searchParams.get("departmentId");
  const departmentIdsParam = searchParams.get("departmentIds");
  const isInternal = searchParams.get("isInternal");
  const isInternalBool = isInternal === "true";
  const isExternalBool = isInternal === "false";
  const [data, setData] = useState<MasterDocumentIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse departmentIds (comma-separated) for QA users viewing MR + QA
  const departmentIds = departmentIdsParam
    ? departmentIdsParam.split(",").map(Number).filter(Boolean)
    : undefined;

  // Per-department pagination state: { [deptId]: { page, limit } }
  const [deptPagination, setDeptPagination] = useState<
    Record<number, { page: number; limit: number }>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // No year filter - fetch all documents
        const result = await getMasterDocumentIndex(
          currentYear, // Only used for display
          departmentId ? parseInt(departmentId) : undefined,
          isInternal !== null ? isInternalBool : undefined,
          departmentIds
        );
        setData(result);

        // Initialize pagination for each department
        const initialPagination: Record<
          number,
          { page: number; limit: number }
        > = {};
        result.departments.forEach((dept) => {
          initialPagination[dept.department.id] = { page: 1, limit: 100 };
        });
        setDeptPagination(initialPagination);
      } catch (err) {
        setError("Failed to load master document index");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, departmentIdsParam, currentYear]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Master_Induk_Dokumen_${currentYear}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 5mm;
      }
      @media print {
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color: #000 !important;
          background-color: #fff !important;
        }
        .print-container {
          font-size: 3px;
          font-family: Arial, sans-serif;
          color: #000;
          background-color: #fff !important;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-before: always;
        }
        .department-section {
          page-break-inside: avoid;
          background-color: #fff !important;
        }
        .border-2 {
          border-width: 2px !important;
        }
        .border-black {
          border-color: #000 !important;
        }
        .border-b-2 {
          border-bottom-width: 2px !important;
        }
        .border-b {
          border-bottom-width: 1px !important;
        }
        .border-r {
          border-right-width: 1px !important;
        }
        img {
          max-height: 48px;
          object-fit: contain;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          background-color: #fff !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 6px 10px;
          text-align: left;
          color: #000;
          background-color: #fff !important;
        }
        th {
          background-color: #e0e0e0 !important;
          font-weight: bold;
        }
        .header-info {
          margin-bottom: 20px;
          background-color: #fff !important;
        }
        .header-info table {
          border: none;
          background-color: #fff !important;
        }
        .header-info td {
          border: none !important;
          padding: 2px 0;
          background-color: #fff !important;
        }
        .category-title {
          font-weight: bold;
          font-size: 12px;
          margin-top: 20px;
          margin-bottom: 10px;
          color: #000 !important;
          background-color: #fff !important;
        }
        .text-blue-600 {
          color: #2563eb !important;
        }
        .italic {
          font-style: italic;
        }
        tr {
          background-color: #fff !important;
        }
        tbody tr {
          background-color: #fff !important;
        }
        .grid {
          display: grid;
        }
        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .grid-cols-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .justify-center {
          justify-content: center;
        }
        .text-center {
          text-align: center;
        }
        .font-bold {
          font-weight: bold;
        }
        .text-base {
          font-size: 1rem;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-xs {
          font-size: 0.75rem;
        }
        .p-0 {
          padding: 0;
        }
        .p-2 {
          padding: 0.5rem;
        }
        .p-4 {
          padding: 1rem;
        }
        .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .mt-1 {
          margin-top: 0.25rem;
        }
        .ml-2 {
          margin-left: 0.5rem;
        }
        .ml-8 {
          margin-left: 2rem;
        }
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        .w-48 {
          width: 12rem;
        }
        .flex-1 {
          flex: 1 1 0%;
        }
        .print-footer-watermark {
          display: block !important;
          position: fixed;
          bottom: 15mm;
          right: 15mm;
          z-index: 9999;
          pointer-events: none;
        }
      }
    `,
  });

  const handleExportExcel = async () => {
    if (!data) return;
    await exportMasterIndexToExcel(
      data,
      isInternal !== null ? isInternalBool : null
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Pagination helpers per department
  const getDeptPagination = (deptId: number) => {
    return deptPagination[deptId] || { page: 1, limit: 100 };
  };

  const setDeptPage = (deptId: number, page: number) => {
    setDeptPagination((prev) => ({
      ...prev,
      [deptId]: { ...getDeptPagination(deptId), page },
    }));
  };

  const setDeptLimit = (deptId: number, limit: number) => {
    setDeptPagination((prev) => ({
      ...prev,
      [deptId]: { page: 1, limit }, // Reset to page 1 when limit changes
    }));
  };

  // Count total documents across all categories for a department
  const getTotalDocsForDept = (
    categories: MasterDocumentIndex["departments"][number]["categories"]
  ) => {
    return categories.reduce((sum, cat) => sum + cat.documents.length, 0);
  };

  const getTotalPages = (totalDocs: number, deptId: number) => {
    const { limit } = getDeptPagination(deptId);
    return Math.max(1, Math.ceil(totalDocs / limit));
  };

  // Get paginated documents across categories
  const getPaginatedCategories = (
    categories: MasterDocumentIndex["departments"][number]["categories"],
    deptId: number
  ) => {
    const { page, limit } = getDeptPagination(deptId);
    const start = (page - 1) * limit;
    const end = start + limit;

    // Flatten all documents with their category info
    const allDocs: {
      doc: any;
      categoryGroup: string;
      categoryLabel: string;
    }[] = [];
    categories.forEach((cat) => {
      cat.documents.forEach((doc) => {
        allDocs.push({
          doc,
          categoryGroup: cat.category,
          categoryLabel: cat.label,
        });
      });
    });

    // Slice for current page
    const pageDocs = allDocs.slice(start, end);

    // Re-group back into categories
    const groupedCategories: {
      category: string;
      label: string;
      documents: any[];
      startNo: number;
    }[] = [];

    let globalNo = start + 1;
    pageDocs.forEach(({ doc, categoryGroup, categoryLabel }) => {
      let existing = groupedCategories.find(
        (g) => g.category === categoryGroup
      );
      if (!existing) {
        existing = {
          category: categoryGroup,
          label: categoryLabel,
          documents: [],
          startNo: globalNo,
        };
        groupedCategories.push(existing);
      }
      existing.documents.push({ ...doc, globalNo });
      globalNo++;
    });

    return groupedCategories;
  };

  const renderDeptPagination = (deptId: number, totalDocs: number) => {
    const { page, limit } = getDeptPagination(deptId);
    const totalPages = getTotalPages(totalDocs, deptId);

    if (totalDocs <= 10) return null;

    const handlePrevious = () => {
      if (page > 1) setDeptPage(deptId, page - 1);
    };

    const handleNext = () => {
      if (page < totalPages) setDeptPage(deptId, page + 1);
    };

    const renderPageNumbers = () => {
      const pages = [];
      const maxPagesToShow = 3;

      let startPage = Math.max(1, page - 1);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={i === page}
              onClick={(e) => {
                e.preventDefault();
                setDeptPage(deptId, i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      return pages;
    };

    return (
      <div className="flex justify-end items-center gap-2 mt-3 no-print">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{t("masterIndex.limit")}</p>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setDeptLimit(deptId, parseInt(value))}
          >
            <SelectTrigger className="bg-white w-[80px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
                aria-disabled={page === 1}
              />
            </PaginationItem>

            {renderPageNumbers()}

            {totalPages > page + 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {totalPages > 3 && page < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeptPage(deptId, totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <Layout
      title={t("masterIndex.title")}
      items={[
        { label: t("common.home"), href: "/" },
        { label: t("sidebar.sharedDocuments"), href: "/shared-documents" },
      ]}
    >
      <div className="relative min-h-screen pb-12">
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8"
        >
          {/* Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl shadow-primary/5">
            <div className="flex items-center gap-5">
              <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/50 hover:bg-white rounded-xl shadow-sm border border-primary/10 h-11 w-11"
                  onClick={() =>
                    departmentId || departmentIdsParam ? navigate(-1) : navigate("/shared-documents")
                  }
                >
                  <ChevronLeft className="h-5 w-5 text-primary" />
                </Button>
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-modern">
                  {t("masterIndex.title")}{" "}
                  <span className="text-primary/60 block text-sm font-normal mt-0.5">
                    {isInternal === "true"
                      ? t("masterIndex.internalProtocol")
                      : isInternal === "false"
                      ? t("masterIndex.externalProtocol")
                      : t("masterIndex.generalIndex")}
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {data?.canExport && (
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  disabled={loading}
                  className="flex-1 md:flex-none border-primary/20 bg-white/50 hover:bg-white text-primary rounded-xl h-11 px-6 shadow-sm font-medium transition-all"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("masterIndex.excelExport")}
                </Button>
              )}
              {data?.canPrint && (
                <Button 
                  onClick={() => handlePrint()} 
                  disabled={loading}
                  className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-8 shadow-lg shadow-primary/20 font-medium transition-all active:scale-95"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {t("masterIndex.print")}
                </Button>
              )}
            </div>
          </div>

          <Card className="border-none bg-white/40 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden rounded-3xl">
            <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {!loading && !error && data && (
            <div
              ref={componentRef}
              className="print-container font-['Arial'] text-black overflow-x-auto custom-scrollbar"
            >
              <div className="min-w-[1000px] p-8 space-y-12">
                {data.departments.map((dept, deptIndex) => {
                  const deptId = dept.department.id;
                  const totalDocs = getTotalDocsForDept(dept.categories);
                  const { page } = getDeptPagination(deptId);
                  const totalPages = getTotalPages(totalDocs, deptId);
                  const paginatedCategories = getPaginatedCategories(
                    dept.categories,
                    deptId
                  );

                  const originalCategoryOrder = dept.categories.map(
                    (c) => c.category
                  );

                  return (
                    <motion.div
                      key={deptId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: deptIndex * 0.1 }}
                      className={`department-section ${
                        deptIndex > 0 ? "page-break pt-8" : ""
                      }`}
                    >
                      {/* Outer Border Wrapper */}
                      <div className="border-2 border-black p-0 bg-white shadow-sm ring-1 ring-black/5 rounded-sm overflow-hidden">
                        {/* Header Section */}
                        <div className="border-b-2 border-black bg-white">
                          {/* Logo and Title Row */}
                          <div className="flex items-center border-b border-black">
                            <div className="border-r border-black p-4 flex items-center justify-center w-56">
                              <img
                                src={ArtienceLogo}
                                alt="Artience"
                                className="h-14 object-contain"
                              />
                            </div>
                            <div className="flex-1 text-center py-4 bg-gray-50/30">
                              <div className="font-bold text-lg tracking-wide">
                                DAFTAR INDUK DOKUMEN{" "}
                                {isInternalBool
                                  ? "INTERNAL"
                                  : isExternalBool
                                  ? "EKSTERNAL"
                                  : "INTERNAL & EKSTERNAL"}{" "}
                                /{" "}
                                <span className="italic text-blue-700 font-medium">
                                  LIST OF{" "}
                                  {isInternalBool
                                    ? "INTERNAL"
                                    : isExternalBool
                                    ? "EXTERNAL"
                                    : "INTERNAL & EXTERNAL"}{" "}
                                  MASTER DOCUMENTS
                                </span>
                              </div>
                              <div className="font-bold text-sm mt-1 text-black/80">
                                PT. TOYO INK INDONESIA
                              </div>
                            </div>
                          </div>

                          {/* Document Info Row */}
                          <div className="grid grid-cols-4 text-xs border-b border-black bg-white">
                            <div className="border-r border-black px-3 py-2 font-medium">
                              No. Dokumen : FRM / III / MR / 03
                            </div>
                            <div className="border-r border-black px-3 py-2">
                              <span className="font-medium">{t("masterIndex.dateEffective")}:</span> 5 April 2026
                            </div>
                            <div className="border-r border-black px-3 py-2 font-medium">
                              {t("masterIndex.revisionStatus")}: 05
                            </div>
                            <div className="px-3 py-2 font-medium text-right">
                              {t("masterIndex.page")}: {page} {t("masterIndex.of")} {totalPages}
                            </div>
                          </div>

                          {/* Year, Department, Document Type Info */}
                          <div className="grid grid-cols-2 text-sm bg-white">
                            <div className="border-r border-black">
                              <div className="px-4 py-2 border-b border-black">
                                <span className="font-bold">Tahun / </span>
                                <span className="italic text-blue-700 font-medium">Year</span>
                                <span className="ml-10 tracking-wider">: {currentYear}</span>
                              </div>
                              <div className="px-4 py-2 border-b border-black">
                                <span className="font-bold">Departemen / </span>
                                <span className="italic text-blue-700 font-medium">Department</span>
                                <span className="ml-4">: {dept.department.name}</span>
                              </div>
                              <div className="px-4 py-2">
                                <span className="font-bold">Jenis Dokumen / </span>
                                <span className="italic text-blue-700 font-medium">Document Type</span>
                                <span className="ml-2">: {dept.documentType}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center p-4">
                              <div className="border-[3px] border-blue-600 p-2 flex flex-col items-center justify-center w-[160px] h-[80px] bg-white">
                                <span className="text-[9px] text-blue-600 font-bold">
                                  PT. TOYO INK INDONESIA
                                </span>
                                <span className="text-3xl text-blue-600 font-bold mt-1">
                                  MASTER
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Categories */}
                        <div className="p-6 bg-white">
                          {paginatedCategories.map((category, catIdx) => {
                            const originalIdx = originalCategoryOrder.indexOf(
                              category.category
                            );
                            const catDisplayNum =
                              originalIdx >= 0 ? originalIdx + 1 : 1;

                            return (
                              <motion.div 
                                key={category.category} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: deptIndex * 0.1 + catIdx * 0.05 }}
                                className="mb-10 last:mb-0"
                              >
                                <h3 className="category-title font-bold mb-4 text-black text-sm flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                                    {catDisplayNum}
                                  </span>
                                  {category.label}
                                </h3>
                                <div className="border border-black overflow-hidden shadow-sm">
                                  <table className="w-full border-collapse text-[11px]">
                                    <thead>
                                      <tr className="bg-gray-100 border-b border-black">
                                        <th className="border-r border-black px-3 py-2 text-left w-10 font-bold uppercase tracking-tight">
                                          No.
                                        </th>
                                        <th className="border-r border-black px-3 py-2 text-left font-bold uppercase tracking-tight">
                                          Nama Dokumen /{" "}
                                          <span className="italic text-blue-700 font-normal lowercase">
                                            Document Name
                                          </span>
                                        </th>
                                        <th className="border-r border-black px-3 py-2 text-left w-40 font-bold uppercase tracking-tight">
                                          Nomor Dokumen /{" "}
                                          <span className="italic text-blue-700 font-normal lowercase">
                                            Document Number
                                          </span>
                                        </th>
                                        <th className="border-r border-black px-3 py-2 text-center w-24 font-bold uppercase tracking-tight">
                                          Nomor Revisi /{" "}
                                          <span className="italic text-blue-700 font-normal lowercase">
                                            Rev. No.
                                          </span>
                                        </th>
                                        <th className="border-r border-black px-3 py-2 text-left w-32 font-bold uppercase tracking-tight">
                                          Tanggal Terbit /{" "}
                                          <span className="italic text-blue-700 font-normal lowercase">
                                            Issue Date
                                          </span>
                                        </th>
                                        <th className="px-3 py-2 text-left w-32 font-bold uppercase tracking-tight">
                                          Tanggal Revisi /{" "}
                                          <span className="italic text-blue-700 font-normal lowercase">
                                            Revision Date
                                          </span>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/10">
                                      {category.documents.map((doc: any) => (
                                        <tr
                                          key={doc.id}
                                          className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                          onClick={() => navigate(`/documents/detail/${doc.id}`)}
                                        >
                                          <td className="border-r border-black px-3 py-2 font-medium">
                                            {doc.globalNo}
                                          </td>
                                          <td className="border-r border-black px-3 py-2 group-hover:text-primary font-medium">
                                            {doc.name}
                                          </td>
                                          <td className="border-r border-black px-3 py-2 font-mono text-[10px]">
                                            {doc.documentCode}
                                          </td>
                                          <td className="border-r border-black px-3 py-2 text-center">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded-sm font-bold">
                                              {doc.revision
                                                .toString()
                                                .padStart(2, "0")}
                                            </span>
                                          </td>
                                          <td className="border-r border-black px-3 py-2">
                                            {formatDate(doc.dateOfIssue)}
                                          </td>
                                          <td className="px-3 py-2">
                                            {formatDate(doc.releaseDate)}
                                          </td>
                                        </tr>
                                      ))}
                                      {category.documents.length === 0 && (
                                        <tr>
                                          <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-gray-400 italic"
                                          >
                                            {t("masterIndex.noDocuments")}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            );
                          })}

                          {dept.categories.length === 0 && (
                            <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                              No approved documents identified for this department
                            </div>
                          )}

                          {/* Pagination for this department */}
                          <div className="mt-8">
                            {renderDeptPagination(deptId, totalDocs)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {data.departments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                    <div className="p-4 bg-muted/20 rounded-full">
                      <ChevronLeft className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-medium">No departmental records found</p>
                  </div>
                )}
              </div>

              {/* Fixed watermark for print only at the bottom of every page */}
              <div className="hidden print-footer-watermark">
                <div className="border-[3px] border-blue-600/80 p-2 flex flex-col items-center justify-center w-[200px] h-[80px] bg-white">
                  <span className="text-[10px] text-blue-600 font-bold">
                    PT. TOYO INK INDONESIA
                  </span>
                  <span className="text-4xl text-blue-600 font-bold mt-1">
                    MASTER
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  </div>
</Layout>
);
}
