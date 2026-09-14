import React, { useState, useEffect } from "react";
import { getQaPerformanceData } from "@/services/api/dashboard";
import { getApprovalRequests } from "@/services/api/approvals";
import BarChartCard from "./BarChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExportApprovalsModal from "@/pages/Approvals/components/ExportApprovalsModal";
import { ApprovalRequest } from "@/services/api/types/documents.types";

const QATimePerformanceChart: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
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
      console.error("Failed to fetch QA time performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = async () => {
    try {
      setIsExportLoading(true);
      // Fetch all approvals for export
      const res = await getApprovalRequests("all", 1, 1000);
      setApprovalsForExport(res.approvals);
      setOpenExportModal(true);
    } catch (error) {
      console.error("Failed to fetch approvals for export:", error);
    } finally {
      setIsExportLoading(false);
    }
  };

  const timeChartData = [
    {
      name: "Total Request",
      value: data?.totalDocReq || 0,
      fill: "#3b82f6" // Blue
    },
    {
      name: "Within 3 Days",
      value: data?.within3Days || 0,
      fill: "#10b981" // Green
    },
    {
      name: "Over 3 Days",
      value: data?.over3Days || 0,
      fill: "#f59e0b" // Amber/Orange
    },
    {
      name: "Pending Approval",
      value: data?.pendingQa || 0,
      fill: "#ef4444" // Red
    }
  ];

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 mt-8 bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg relative overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-4">
        <CardTitle className="text-xl font-bold">QA Approve Time (SLA: 3 Days)</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
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
            className="h-9"
          >
            {isExportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="w-full pb-4">
            <BarChartCard 
              title=""
              data={timeChartData}
              seriesName="Documents"
              height="350px"
              colors={timeChartData.map(d => d.fill)}
            />
          </div>
        )}
      </CardContent>

      <ExportApprovalsModal
        open={openExportModal}
        onOpenChange={setOpenExportModal}
        approvals={approvalsForExport}
        exportType="qa-time-performance"
      />
    </Card>
  );
};

export default QATimePerformanceChart;
