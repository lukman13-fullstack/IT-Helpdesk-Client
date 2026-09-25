import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/common/confirm-dialog";
import { notify } from "@/lib/toast";
import { getTicketCategories, deleteTicketCategory, TicketCategory } from "@/services/api/ticketCategories";

export default function TicketCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number>("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getTicketCategories();
      setCategories(res.ticketCategories);
    } catch (err) {
      console.error(err);
      notify.error("Failed to load ticket categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async () => {
    try {
      await deleteTicketCategory(deleteId);
      notify.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      notify.error("Failed to delete category");
    }
    setDeleteOpen(false);
  };

  return (
    <Layout title="Ticket Categories" items={[{ label: "Home", href: "/" }]}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-4"
      >
        <Card className="p-5">
          <CardHeader>
            <CardTitle>Ticket Categories</CardTitle>
            <CardDescription>
              Manage categories for IT support tickets
            </CardDescription>
            <div className="flex justify-end">
              <Button
                className="bg-success hover:bg-success/80 dark:bg-primary dark:hover:bg-primary/80"
                onClick={() => navigate("/ticket-categories/create")}
              >
                <Plus className="mr-2" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No categories found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-primary text-primary-foreground rounded-tl-md">No</TableHead>
                    <TableHead className="bg-primary text-primary-foreground">Category Name</TableHead>
                    <TableHead className="bg-primary text-primary-foreground">Description</TableHead>
                    <TableHead className="bg-primary text-primary-foreground">Sub Categories</TableHead>
                    <TableHead className="bg-primary w-1/12 text-primary-foreground rounded-tr-md">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="border-1 border-muted">
                  {categories.map((cat, index) => (
                    <TableRow key={cat.id} className="border-b border-muted">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.description || "-"}</TableCell>
                      <TableCell>
                        {cat.children && cat.children.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {cat.children.map(child => (
                              <span key={child.id} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                                {child.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center justify-center">
                          <Button
                            onClick={() => navigate(`/ticket-categories/update/${cat.id}`)}
                            size="icon"
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-500 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-red-600 hover:bg-red-500 hover:text-red-500"
                            onClick={() => {
                              setDeleteOpen(true);
                              setDeleteId(cat.id!);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
        yesText="Delete"
        noText="Cancel"
        onYes={handleDeleteCategory}
      />
    </Layout>
  );
}
