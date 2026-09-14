import React, { useState, useEffect } from "react";
import { getQaPerformanceData } from "@/services/api/dashboard";
import BarChartCard from "./BarChartCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExportApprovalsModal from "@/pages/Approvals/components/ExportApprovalsModal";
import { getDocuments } from "@/services/api/documents";
import { ApprovalRequest } from "@/services/api/types/documents.types";

const QAPerformanceChart: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Set default dates to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(format(firstDay, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  const [openExportModal, setOpenExportModal] = useState(false);
  const [approvalsForExport, setApprovalsForExport] = useState<ApprovalRequest[]>([]);
  const [isExportLoading, setIsExportLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getQaPerformanceData(startDate, endDate);
      setData(res);
    } catch (error) {
      console.error("Failed to fetch QA performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = async () => {
    try {
      setIsExportLoading(true);
      // Fetch full documents instead of just the user's approval requests
      const res = await getDocuments({ limit: 1000 });
      
      // Wrap them in a mock ApprovalRequest structure for the modal & export
      const mappedApprovals: any[] = res.documents.map((doc: any) => {
        return {
          id: doc.id,
          documentId: doc.id,
          document: doc,
          creator: doc.uploader,
          // Default values that will be overridden in ExportApprovalsModal
          level: 0, 
          status: "pending", 
          approver: { fullName: "-" },
          createdAt: doc.createdAt
        };
      });
      
      setApprovalsForExport(mappedApprovals);
      setOpenExportModal(true);
    } catch (error) {
      console.error("Failed to fetch documents for export:", error);
    } finally {
      setIsExportLoading(false);
    }
  };

  const dynamicLevelData = (data?.dynamicLevels || []).map((lvl: any, index: number) => {
    // Array of nice colors to pick from for dynamic levels
    const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16", "#eab308"];
    return {
      name: `Level ${lvl.level - 1} Approv`,
      value: lvl.count,
      fill: colors[index % colors.length]
    };
  });

  const chartData = [
    {
      name: "Total doc req",
      value: data?.totalDocReq || 0,
      fill: "#3b82f6" // Blue
    },
    {
      name: "QA Approve",
      value: data?.qaApprove || 0,
      fill: "#10b981" // Green
    },
    ...dynamicLevelData,
    {
      name: "Pending Approval",
      value: data?.totalPending || 0,
      fill: "#f87171" // Red
    }
  ];

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 mt-8 bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 relative z-10 border-b border-slate-100">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            QA Performance
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">Approval metrics based on document request date</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 px-1 uppercase tracking-wider">From</span>
              <input 
                type="date" 
                className="text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 px-1 uppercase tracking-wider">To</span>
              <input 
                type="date" 
                className="text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleExportClick}
            disabled={isExportLoading}
            className="h-10 ml-2"
          >
            {isExportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export Excel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="w-full pb-4">
             <BarChartCard 
               title="Approval Progress"
               data={chartData}
               seriesName="Documents"
               height="350px"
               colors={chartData.map(d => d.fill)}
             />
          </div>
        )}
      </CardContent>

      <ExportApprovalsModal
        open={openExportModal}
        onOpenChange={setOpenExportModal}
        approvals={approvalsForExport}
        exportType="qa-performance"
        dynamicLevels={data?.dynamicLevels || []}
      />
    </Card>
  );
};

export default QAPerformanceChart;
