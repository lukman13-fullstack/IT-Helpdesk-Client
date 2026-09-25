import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notify } from "@/lib/toast";
import { updateTicketCategory, getTicketCategoryByID, getTicketCategories, TicketCategory } from "@/services/api/ticketCategories";
import CategoryHierarchies from "./components/CategoryHierarchies";

export default function UpdateTicketCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [hierarchies, setHierarchies] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const categoryData = await getTicketCategoryByID(id as string);
        
        if (!categoryData || typeof categoryData !== "object") {
          throw new Error("Invalid category data received");
        }

        setFormData({
          name: categoryData.name || "",
          description: categoryData.description || "",
        });

        if (categoryData.children) {
          // Helper to map DB children to HierarchyItem state recursively
          const mapChildren = (children: any[]): any[] => {
            return children.map((c: any) => ({
              id: c.id,
              name: c.name,
              description: c.description || "",
              children: c.children ? mapChildren(c.children) : []
            }));
          };
          setHierarchies(mapChildren(categoryData.children));
        }

      } catch (err) {
        console.error(err);
        notify.error("Failed to load category data");
      }
    };
    if (id) init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTicketCategory(id as string, {
        name: formData.name,
        description: formData.description,
        hierarchies: hierarchies,
      });
      notify.success("Category updated successfully");
      navigate("/ticket-categories");
    } catch (err: any) {
      notify.error(err.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Update Category" items={[{ label: "Home", href: "/" }, { label: "Ticket Categories", href: "/ticket-categories" }]}>
      <div className="container mx-auto p-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Update Ticket Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {loading ? "Saving..." : "Update Category"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
