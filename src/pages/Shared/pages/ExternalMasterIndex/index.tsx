import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, ChevronLeft, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import {
  getExternalMasterIndex,
  ExternalMasterIndexData,
} from "@/services/api/documents";
import ArtienceLogo from "@/assets/artience.png";
import { exportExternalMasterIndexToExcel } from "@/lib/excelExport";

export default function ExternalMasterIndex() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const componentRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  const departmentId = searchParams.get("departmentId");
  const departmentIdsParam = searchParams.get("departmentIds");
  const [data, setData] = useState<ExternalMasterIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse departmentIds (comma-separated) for QA users viewing MR + QA
  const departmentIds = departmentIdsParam
    ? departmentIdsParam.split(",").map(Number).filter(Boolean)
    : undefined;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getExternalMasterIndex(
          departmentId ? parseInt(departmentId) : undefined,
          departmentIds
        );
        setData(result);
      } catch (err) {
        setError("Failed to load external master document index");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, departmentIdsParam]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `External_Master_Index_${currentYear}`,
    pageStyle: `
      @page {
        size: A4 landscape;
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
      }
    `,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleExportExcel = async () => {
    if (!data) return;
    await exportExternalMasterIndexToExcel(data);
  };

  return (
    <Layout
      title="Master Induk Dokumen Eksternal"
      items={[
        { label: "Home", href: "/" },
        { label: "Shared Documents", href: "/shared-documents" },
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
                  Master Induk Dokumen Eksternal{" "}
                  <span className="text-primary/60 block text-sm font-normal mt-0.5">
                    External Source Protocol Index
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
                  Excel Export
                </Button>
              )}
              {data?.canPrint && (
                <Button 
                  onClick={() => handlePrint()} 
                  disabled={loading}
                  className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-8 shadow-lg shadow-primary/20 font-medium transition-all active:scale-95"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
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
                {data.departments.map((dept, deptIndex) => (
                  <motion.div
                    key={dept.department.id}
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
                            <div className="font-bold text-lg tracking-wide uppercase">
                              DAFTAR INDUK DOKUMEN EKSTERNAL /{" "}
                              <span className="italic text-blue-700 font-medium">
                                LIST OF EXTERNAL MASTER DOCUMENTS
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
                            <span className="font-medium">Tanggal Efektif:</span> 5 April 2026
                          </div>
                          <div className="border-r border-black px-3 py-2 font-medium">
                            Status Revisi: 05
                          </div>
                          <div className="px-3 py-2 font-medium text-right">
                            Hal: 1 dari {Math.max(1, Math.ceil(dept.documents.length / 10))}
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

                      {/* Documents Table */}
                      <div className="p-6 bg-white overflow-hidden">
                        <div className="border border-black shadow-sm">
                          <table className="w-full border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-gray-100 border-b border-black">
                                <th className="border-r border-black px-3 py-2 text-left w-12 font-bold uppercase tracking-tight">
                                  No.
                                </th>
                                <th className="border-r border-black px-3 py-2 text-left font-bold uppercase tracking-tight">
                                  Nama Dokumen /{" "}
                                  <span className="italic text-blue-700 font-normal lowercase">
                                    Document Name
                                  </span>
                                </th>
                                <th className="border-r border-black px-3 py-2 text-left w-40 font-bold uppercase tracking-tight">
                                  Lembaga Penerbit /{" "}
                                  <span className="italic text-blue-700 font-normal lowercase">
                                    Publishing Institution
                                  </span>
                                </th>
                                <th className="border-r border-black px-3 py-2 text-center w-32 font-bold uppercase tracking-tight">
                                  Bentuk Dokumen /{" "}
                                  <span className="italic text-blue-700 font-normal lowercase">
                                    Document Form
                                  </span>
                                </th>
                                <th className="border-r border-black px-3 py-2 text-left w-32 font-bold uppercase tracking-tight">
                                  Tanggal Terbit /{" "}
                                  <span className="italic text-blue-700 font-normal lowercase">
                                    Date of Issue
                                  </span>
                                </th>
                                <th className="px-3 py-2 text-left w-32 font-bold uppercase tracking-tight">
                                  Tanggal Kadaluarsa /{" "}
                                  <span className="italic text-blue-700 font-normal lowercase">
                                    Expired Date
                                  </span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/10">
                              {dept.documents.map((doc) => (
                                <tr 
                                  key={doc.id} 
                                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                  onClick={() => navigate(`/documents/detail/${doc.id}`)}
                                >
                                  <td className="border-r border-black px-3 py-2 font-medium">
                                    {doc.no}
                                  </td>
                                  <td className="border-r border-black px-3 py-2 group-hover:text-primary font-medium">
                                    {doc.name}
                                  </td>
                                  <td className="border-r border-black px-3 py-2">
                                    {doc.publishingInstitution}
                                  </td>
                                  <td className="border-r border-black px-3 py-2 text-center uppercase text-[10px]">
                                    {doc.documentFormat}
                                  </td>
                                  <td className="border-r border-black px-3 py-2">
                                    {formatDate(doc.dateOfIssue)}
                                  </td>
                                  <td className="px-3 py-2 text-amber-900">
                                    {formatDate(doc.expiredDate)}
                                  </td>
                                </tr>
                              ))}
                              {dept.documents.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-6 py-10 text-center text-gray-400 italic"
                                  >
                                    No external documents identified for this source
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {data.departments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                    <div className="p-4 bg-muted/20 rounded-full">
                      <ChevronLeft className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-medium">No external records found</p>
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
