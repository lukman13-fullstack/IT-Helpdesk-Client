import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Clock, User, MapPin, Copy } from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { asyncGetPrintHistoryActionCreator } from "@/store/printRequests/action";

export default function PrintHistoryTab() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { printHistory, loading } = useAppSelector(
    (state) => state.printRequests
  );

  useEffect(() => {
    if (id) {
      dispatch(asyncGetPrintHistoryActionCreator(Number(id)));
    }
  }, [dispatch, id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (loading && printHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (printHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            No print history available for this obsolete document
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Historical print records for this obsolete document
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Distribution</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Printed At</TableHead>
              <TableHead>Expired At</TableHead>
              <TableHead>Approver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {item.requester.fullName}
                  </div>
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={item.reason}
                >
                  {item.reason}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isInternal
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {item.isInternal ? "Internal PTI" : "External PTI"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    {item.copies}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {item.storageLocation}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  {item.printedAt ? (
                    <div className="flex flex-col text-sm">
                      <span>
                        {format(new Date(item.printedAt), "dd MMM HH:mm")}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {item.expiresAt ? (
                    <div className="flex flex-col text-sm">
                      <span>
                        {format(new Date(item.expiresAt), "dd MMM HH:mm")}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {item.approvedBy ? (
                    <div className="flex flex-col text-sm">
                      <span>{item.approvedBy.fullName}</span>
                      {item.approvedAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.approvedAt), "dd MMM HH:mm")}
                        </span>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
