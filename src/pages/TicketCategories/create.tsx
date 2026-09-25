import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notify } from "@/lib/toast";
import { createTicketCategory, getTicketCategories, TicketCategory } from "@/services/api/ticketCategories";
import CategoryHierarchies from "./components/CategoryHierarchies";

export default function CreateTicketCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  
  const [hierarchies, setHierarchies] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTicketCategory({
        name: formData.name,
        description: formData.description,
        hierarchies: hierarchies,
      });
      notify.success("Category created successfully");
      navigate("/ticket-categories");
    } catch (err: any) {
      notify.error(err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Category" items={[{ label: "Home", href: "/" }, { label: "Ticket Categories", href: "/ticket-categories" }]}>
      <div className="container mx-auto p-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Ticket Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hardware"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              
              <CategoryHierarchies 
                hierarchies={hierarchies}
                onChange={setHierarchies}
              />

              <div className="flex gap-2 justify-end pt-4 mt-8 border-t border-muted pt-6">
                <Button type="button" variant="outline" onClick={() => navigate("/ticket-categories")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Category"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
