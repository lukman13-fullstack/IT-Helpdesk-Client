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

import { getFormMasterIndex } from "@/services/api/documents";
import type { FormMasterIndexData } from "@/services/api/types/documents.types";
import ArtienceLogo from "@/assets/artience.png";
import { exportFormMasterIndexToExcel } from "@/lib/excelExport";
import { useLanguage } from "@/context/LanguageContext";

export default function FormMasterIndex() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const componentRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  const departmentId = searchParams.get("departmentId");
  const departmentIdsParam = searchParams.get("departmentIds");
  const isInternal = searchParams.get("isInternal");
  const isInternalBool = isInternal === "true";
  const [data, setData] = useState<FormMasterIndexData | null>(null);
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
        const result = await getFormMasterIndex(
          currentYear,
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
        setError("Failed to load form master index");
        console.error("Error fetching form master index:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, departmentIdsParam, currentYear]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 5mm;
      }
      @media print {
        html, body {
          background-color: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-family: Arial, sans-serif !important;
        }
        .print-container {
          font-family: Arial, sans-serif !important;
          font-size: 3px;
          color: #000 !important;
          background-color: white !important;
        }
        .department-section {
          page-break-inside: avoid;
          background-color: white !important;
        }
        .page-break {
          page-break-before: always;
        }
        .no-print {
          display: none !important;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          background-color: white !important;
          color: #000 !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 4px 8px;
          text-align: left;
          color: #000 !important;
          background-color: white !important;
          font-family: Arial, sans-serif !important;
        }
        th {
          font-weight: bold;
          background-color: #e0e0e0 !important;
          color: #000 !important;
        }
        .text-blue-600, .italic.text-blue-600 {
          color: #2563eb !important;
          font-style: italic;
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
        .font-bold {
          font-weight: bold;
          color: #000 !important;
        }
        .text-base, .text-sm, .text-xs {
          color: #000 !important;
        }
        div, span, p {
          color: #000 !important;
          font-family: Arial, sans-serif !important;
        }
        .italic {
          font-style: italic;
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
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          pointer-events: none;
        }
      }
    `,
  });

  const handleExportExcel = async () => {
    if (!data) return;
    await exportFormMasterIndexToExcel(
      data
    );
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

  const getPaginatedDocs = (docs: any[], deptId: number) => {
    const { page, limit } = getDeptPagination(deptId);
    const start = (page - 1) * limit;
    return docs.slice(start, start + limit);
  };

  const getTotalPages = (totalDocs: number, deptId: number) => {
    const { limit } = getDeptPagination(deptId);
    return Math.max(1, Math.ceil(totalDocs / limit));
  };

  const renderDeptPagination = (deptId: number, totalDocs: number) => {
    const { page, limit } = getDeptPagination(deptId);
    const totalPages = getTotalPages(totalDocs, deptId);

    // Don't render pagination if total docs <= minimum limit
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
      title={t("masterIndex.formTitle")}
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
                  {t("masterIndex.formTitle")}{" "}
                  <span className="text-primary/60 block text-sm font-normal mt-0.5">
                    {isInternal === "true"
                      ? t("masterIndex.internalFormProtocol")
                      : isInternal === "false"
                      ? t("masterIndex.externalFormProtocol")
                      : t("masterIndex.generalFormIndex")}
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
                  const { page } = getDeptPagination(deptId);
                  const totalPages = getTotalPages(
                    dept.documents.length,
                    deptId
                  );
                  const paginatedDocs = getPaginatedDocs(
                    dept.documents,
                    deptId
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
                      {/* Each department has its own bordered container with header */}
                      <div className="border-2 border-black p-0 bg-white shadow-md rounded-2xl overflow-hidden text-black">
                        {/* Header Section */}
                        <div className="border-b border-black bg-white">
                          {/* Logo and Title Row */}
                          <div className="flex items-stretch border-b border-black min-h-[60px]">
                            <div className="border-r border-black p-2 flex items-center justify-center w-48 flex-shrink-0">
                              <img
                                src={ArtienceLogo}
                                alt="Artience"
                                className="h-10 object-contain"
                              />
                            </div>
                            <div className="flex-1 text-center flex flex-col justify-center py-2 px-4">
                              <div className="font-bold text-lg tracking-tight uppercase leading-tight">
                                DAFTAR INDUK CATATAN /{" "}
                                <span className="italic text-blue-600 font-bold font-modern">
                                  MASTER LIST OF RECORD
                                </span>
                              </div>
                              <div className="font-bold text-sm text-black uppercase">
                                PT. TOYO INK INDONESIA
                              </div>
                            </div>
                          </div>

                          {/* Document Info Row */}
                          <div className="flex items-stretch text-[9px] border-b border-black bg-white">
                            <div className="border-r border-black px-2 py-2 w-48 flex-shrink-0 flex items-center">
                              No. Dokumen : FRM / III / MR / 12
                            </div>
                            <div className="border-r border-black px-2 py-2 flex-1 flex items-center justify-center text-center">
                              {t("masterIndex.dateEffective")}: 5 April 2026
                            </div>
                            <div className="border-r border-black px-2 py-2 flex-1 flex items-center justify-center text-center">
                              {t("masterIndex.revisionStatus")} : 05
                            </div>
                            <div className="px-2 py-2 w-24 flex-shrink-0 flex items-center justify-end">
                              {t("masterIndex.page")} : {page} {t("masterIndex.of")} {totalPages}
                            </div>
                          </div>

                          {/* Year and Department Info + Master Stamp */}
                          <div className="flex text-[10px] bg-white py-3">
                            <div className="flex-1">
                              <div className="px-2 py-1 flex">
                                <div className="w-48 font-bold flex-shrink-0">
                                  Tahun / <span className="italic text-blue-600">Year</span>
                                </div>
                                <div className="ml-2">: {currentYear}</div>
                              </div>
                              <div className="px-2 py-1 flex">
                                <div className="w-48 font-bold flex-shrink-0">
                                  Departemen / <span className="italic text-blue-600">Department</span>
                                </div>
                                <div className="ml-2 uppercase">: {dept.department.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center px-4">
                              <div className="border-[3px] border-blue-600 p-2 flex flex-col items-center justify-center w-[120px] h-[50px] bg-white">
                                <span className="text-[6px] text-blue-600 font-bold leading-tight">
                                  PT. TOYO INK INDONESIA
                                </span>
                                <span className="text-base text-blue-600 font-bold leading-tight">
                                  MASTER
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Documents Table */}
                        <div className="bg-white overflow-x-auto">
                          <table className="w-full border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-gray-50 border-b border-black">
                                <th className="border-r border-black px-1 py-1 text-center w-8 font-bold text-[9px]">
                                  No.
                                </th>
                                <th className="border-r border-black px-1 py-1 text-center font-bold text-[9px]">
                                  Nama Dokumen / <span className="italic text-blue-600 font-bold">Document Name</span>
                                </th>
                                <th className="border-r border-black px-1 py-1 text-center w-36 font-bold text-[9px]">
                                  Nomor Dokumen /<br/>
                                  <span className="italic text-blue-600 font-bold">Document Number</span>
                                </th>
                                <th className="border-r border-black px-1 py-1 text-center w-44 font-bold text-[9px]">
                                  Bentuk Dokumen<br/>
                                  / <span className="italic text-blue-600 font-bold">Document Form</span><br/>
                                  <span className="italic text-blue-600 font-bold">(Digital / Hard Document)</span>
                                </th>
                                <th className="border-r border-black px-1 py-1 text-center w-36 font-bold text-[9px]">
                                  Standar Masa Simpan<br/>
                                  / <span className="italic text-blue-600 font-bold">Shelf Life Standards</span>
                                </th>
                                <th className="border-r border-black px-1 py-1 text-center w-40 font-bold text-[9px]">
                                  Lokasi Penyimpanan<br/>
                                  / <span className="italic text-blue-600 font-bold">Storage Location</span>
                                </th>
                                <th className="px-1 py-1 text-center w-32 font-bold text-[9px]">
                                  Keterangan / <span className="italic text-blue-600 font-bold">Remark</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedDocs.map((doc: any, docIndex: number) => (
                                <tr 
                                  key={doc.id} 
                                  className="border-b border-black hover:bg-primary/5 transition-colors group cursor-pointer"
                                  onClick={() => navigate(`/documents/detail/${doc.id}`)}
                                >
                                  <td className="border-r border-black px-1 py-1 text-center font-medium">
                                    {(page - 1) *
                                      getDeptPagination(deptId).limit +
                                      docIndex +
                                      1}
                                  </td>
                                  <td className="border-r border-black px-2 py-1 font-medium">
                                    {doc.name}
                                  </td>
                                  <td className="border-r border-black px-2 py-1 text-center font-mono text-[10px]">
                                    {doc.documentCode}
                                  </td>
                                  <td className="border-r border-black px-2 py-1 text-center whitespace-nowrap">
                                    {doc.documentTypeLabel || "-"}
                                  </td>
                                  <td className="border-r border-black px-2 py-1 text-center">
                                    {doc.retentionPeriod || "-"}
                                  </td>
                                  <td className="border-r border-black px-2 py-1 text-center">
                                    {doc.storageLocation || "-"}
                                  </td>
                                  <td className="px-2 py-1 italic text-center">
                                    {doc.remark || "-"}
                                  </td>
                                </tr>
                              ))}
                              {dept.documents.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-6 py-10 text-center text-gray-400 italic"
                                  >
                                    {t("masterIndex.noDocuments")}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                          {/* Pagination for this department - only visible on screen */}
                          <div className="mt-8 no-print p-6">
                            {renderDeptPagination(deptId, dept.documents.length)}
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
                    <p className="text-lg font-medium">{t("masterIndex.noRecords")}</p>
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
