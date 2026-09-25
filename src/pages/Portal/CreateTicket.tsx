import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserPortalLayout from "@/components/layout/UserPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notify } from "@/lib/toast";
import { createTicket } from "@/services/api/tickets";
import { getTicketCategories, TicketCategory } from "@/services/api/ticketCategories";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { asyncGetDepartmentsActionCreator } from "@/store/departments/action";
import { useSelector } from "react-redux";

export default function PortalCreateTicket() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { departments } = useSelector((state: any) => state.departments);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    departmentId: "",
    priority: "LOW",
    description: ""
  });

  useEffect(() => {
    dispatch(asyncGetDepartmentsActionCreator(1, 100, ""));
    
    // Fetch categories and flatten them for the dropdown
    getTicketCategories().then((res) => {
      const flattened: any[] = [];
      const flatten = (cats: TicketCategory[], prefix = "") => {
        cats.forEach(c => {
          flattened.push({ id: c.id, name: prefix + c.name });
          if (c.children && c.children.length > 0) {
            flatten(c.children, prefix + c.name + " > ");
          }
        });
      };
      flatten(res.ticketCategories);
      setCategories(flattened);
    }).catch(err => {
      console.error(err);
      notify.error("Failed to load categories");
    });
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.description) {
      notify.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createTicket({
        title: formData.title,
        categoryId: parseInt(formData.categoryId),
        departmentId: formData.departmentId && formData.departmentId !== "none" ? parseInt(formData.departmentId) : null,
        priority: formData.priority,
        description: formData.description
      });
      notify.success("Ticket created successfully");
      navigate("/portal/tickets");
    } catch (err: any) {
      notify.error(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserPortalLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submit Request</h2>
          <p className="text-muted-foreground mt-2">
            Please fill out the form below to report an issue or request a service.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Subject / Title <span className="text-destructive">*</span></Label>
                <Input 
                  id="title"
                  placeholder="E.g., Cannot connect to the office Wi-Fi" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={v => setFormData({...formData, categoryId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={v => setFormData({...formData, priority: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Related Department (Optional)</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={v => setFormData({...formData, departmentId: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments?.map((d: any) => (
                      <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="desc"
                  placeholder="Describe your issue in detail..." 
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/portal')}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserPortalLayout>
  );
}
