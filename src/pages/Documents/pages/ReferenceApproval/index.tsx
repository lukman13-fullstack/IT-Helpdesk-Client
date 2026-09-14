import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Eye, X, BookMarked, Loader2 } from "lucide-react";
import { ApproveDialog, RejectDialog } from "./components";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetReferenceChecksActionCreator } from "@/store/referenceApprovals/action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReferenceApprovalPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { referenceChecks, loading } = useAppSelector(
    (state) => state.referenceApprovals
  );

  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchChecks = () => {
    dispatch(asyncGetReferenceChecksActionCreator(statusFilter));
  };

  useEffect(() => {
    fetchChecks();
  }, [dispatch, statusFilter]);

  const handleOpenApproveDialog = (id: number) => {
    setSelectedId(id);
    setOpenApproveDialog(true);
  };

  const handleOpenRejectDialog = (id: number) => {
    setSelectedId(id);
    setOpenRejectDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout
      title="Reference Approvals"
      items={[
        { label: "Home", href: "/" },
        { label: "Documents", href: "/documents" },
      ]}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Reference Check Approvals
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Code</TableHead>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referenceChecks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No {statusFilter !== "all" ? statusFilter : ""} reference checks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  referenceChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-mono">
                        {check.document.documentCode}
                      </TableCell>
                      <TableCell>
                        {check.document.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {check.reference.code}
                        </Badge>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {check.reference.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {check.document.uploader.fullName}
                        </span>
                      </TableCell>
                      <TableCell>
                        {check.document.department.name}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(check.status)}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(check.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            navigate(`/documents/detail/${check.document.id}`)
                          }
                          title="View Document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {check.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleOpenApproveDialog(check.id)}
                              variant="outline"
                              size="icon"
                              className="hover:bg-green-50 hover:border-green-500"
                              title="Approve"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              onClick={() => handleOpenRejectDialog(check.id)}
                              variant="outline"
                              size="icon"
                              className="hover:bg-red-50 hover:border-red-500"
                              title="Reject"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ApproveDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        checkId={selectedId}
        onSuccess={fetchChecks}
      />
      <RejectDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        checkId={selectedId}
        onSuccess={fetchChecks}
      />
    </Layout>
  );
}
