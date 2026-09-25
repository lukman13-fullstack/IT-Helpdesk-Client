import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import { getTickets, Ticket } from "@/services/api/tickets";
import { notify } from "@/lib/toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterData();
  }, [tickets, search, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err: any) {
      notify.error(err.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = tickets;

    if (statusFilter !== "ALL") {
      result = result.filter(t => t.status === statusFilter);
    }

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(t => 
        t.ticketNumber.toLowerCase().includes(lower) || 
        t.title.toLowerCase().includes(lower) ||
        t.requester?.fullName.toLowerCase().includes(lower)
      );
    }

    setFilteredTickets(result);
  };

  return (
    <Layout title="Tickets Management" items={[{ label: "Home", href: "/dashboard" }, { label: "Tickets", href: "/tickets" }]}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <CardTitle>All Support Tickets</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search tickets..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="WAITING_FOR_USER">Waiting for User</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">Loading data...</TableCell>
                    </TableRow>
                  ) : filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">No tickets found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs">{ticket.ticketNumber}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {ticket.title}
                        </TableCell>
                        <TableCell>{ticket.requester?.fullName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.priority === "CRITICAL" ? "destructive" :
                            ticket.priority === "HIGH" ? "destructive" :
                            ticket.priority === "MEDIUM" ? "default" : "secondary"
                          } className="text-[10px]">
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/tickets/detail/${ticket.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
