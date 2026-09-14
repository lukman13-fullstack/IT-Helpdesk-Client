import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  FileText,
  Hash,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  User,
  GitBranch,
} from "lucide-react";

interface VerificationData {
  companyName: string;
  documentName: string;
  documentNumber: string;
  numberRevision: string;
  effectiveDate: string;
  statusDocument: string;
  version: string;
  department: string;
  category: string;
  uploadedBy: string;
  approvals: {
    level: number;
    approver: string;
    role: string;
    status: string;
    approvedAt: string;
  }[];
}

export default function DocumentVerificationPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await fetch(`${apiUrl}/public/verify/${id}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Document not found");
        }
      } catch (err) {
        setError("Failed to fetch document verification data");
        console.error("Verification fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVerificationData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading document verification...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              {error || "Document could not be verified"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 p-4 pb-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 text-center pt-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Digital Document Verification</h1>
        </div>
        <p className="text-muted-foreground">
          This document has been verified and approved through the DMS QA system
        </p>
      </div>

      {/* Verification Card */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Document Verified
            </CardTitle>
            <Badge 
              variant="default" 
              className={
                data.statusDocument === "Approved" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-yellow-500 hover:bg-yellow-600"
              }
            >
              {data.statusDocument}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Company Info */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Building2 className="h-5 w-5" />
              {data.companyName}
            </div>
          </div>

          {/* Document Details Grid */}
          <div className="space-y-4">
            {/* Document Name */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Document Name</p>
                <p className="font-medium">{data.documentName}</p>
              </div>
            </div>

            {/* Document Number */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Hash className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Document Number</p>
                <p className="font-medium font-mono">{data.documentNumber}</p>
              </div>
            </div>

            {/* Number Revision */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <GitBranch className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Number Revision</p>
                <p className="font-medium">{data.numberRevision}</p>
              </div>
            </div>

            {/* Effective Date */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Effective Date</p>
                <p className="font-medium">{data.effectiveDate}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Status Document</p>
                <p className="font-medium text-green-700">{data.statusDocument}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Approval History */}
          {data.approvals && data.approvals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Approval History
              </h3>
              <div className="space-y-3">
                {data.approvals.map((approval, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {approval.level}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{approval.approver}</p>
                      <p className="text-xs text-muted-foreground">{approval.role}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={
                          approval.status === "approved" 
                            ? "border-green-500 text-green-700" 
                            : "border-yellow-500 text-yellow-700"
                        }
                      >
                        {approval.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {approval.approvedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>This document is issued by the DMS QA system and is valid without signature.</p>
            <p className="mt-1">Verified at: {new Date().toLocaleString("id-ID")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
