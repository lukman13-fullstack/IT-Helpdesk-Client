import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserPortalLayout from "@/components/layout/UserPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTickets, Ticket } from "@/services/api/tickets";
import { notify } from "@/lib/toast";
import { format } from "date-fns";

export default function PortalTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

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

  const outstanding = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "WAITING_FOR_USER",
  );
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS");
  const completed = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'WAITING_FOR_USER': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
      default: return '';
    }
  };

  const renderTicketList = (ticketList: Ticket[]) => {
    if (loading) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          Loading tickets...
        </div>
      );
    }

    if (ticketList.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          You don't have any tickets in this category.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {ticketList.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => navigate(`/portal/tickets/${ticket.id}`)}
            className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold text-primary">
                  {ticket.ticketNumber}
                </span>
                <Badge
                  variant={
                    ticket.priority === "CRITICAL"
                      ? "destructive"
                      : ticket.priority === "HIGH"
                        ? "destructive"
                        : ticket.priority === "MEDIUM"
                          ? "default"
                          : "secondary"
                  }
                  className="text-[10px] h-5"
                >
                  {ticket.priority}
                </Badge>
                <Badge variant="outline" className={`text-[10px] h-5 ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <h3 className="font-medium text-base">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {ticket.description}
              </p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap text-right">
              <div>
                Created: {format(new Date(ticket.createdAt), "MMM d, yyyy")}
              </div>
              {ticket.category && <div>Category: {ticket.category.name}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <UserPortalLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Tickets</h2>
            <p className="text-muted-foreground mt-2">
              View and track the status of all your support requests.
            </p>
          </div>
          <Button asChild>
            <Link to="/portal/tickets/new">Create New Ticket</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 sm:p-6">
            <Tabs defaultValue="outstanding" className="w-full">
              <div className="px-4 pt-4 sm:px-0 sm:pt-0 border-b sm:border-0">
                <TabsList className="w-full sm:w-auto grid grid-cols-3 h-auto p-1">
                  <TabsTrigger value="outstanding" className="py-2">
                    Outstanding{" "}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-background/50"
                    >
                      {outstanding.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="inprogress" className="py-2">
                    On Progress{" "}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-background/50"
                    >
                      {inProgress.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="py-2">
                    Completed{" "}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-background/50"
                    >
                      {completed.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 sm:p-0 sm:mt-6">
                <TabsContent value="outstanding">
                  {renderTicketList(outstanding)}
                </TabsContent>

                <TabsContent value="inprogress">
                  {renderTicketList(inProgress)}
                </TabsContent>

                <TabsContent value="completed">
                  {renderTicketList(completed)}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </UserPortalLayout>
  );
}
