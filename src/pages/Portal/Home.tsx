import React from "react";
import { Link } from "react-router-dom";
import UserPortalLayout from "@/components/layout/UserPortalLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, ListTodo, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalHome() {
  return (
    <UserPortalLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">How can we help you today?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to the IT Helpdesk Portal. Choose an option below to create a new support request or track your existing tickets.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Submit a Request</CardTitle>
                <CardDescription>Experiencing an issue or need IT assistance?</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/portal/tickets/new">
                  <Button className="w-full">Create New Ticket</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <ListTodo className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Track My Tickets</CardTitle>
                <CardDescription>View the status of your previous and ongoing requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/portal/tickets">
                  <Button variant="outline" className="w-full">View My Tickets</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </UserPortalLayout>
  );
}
