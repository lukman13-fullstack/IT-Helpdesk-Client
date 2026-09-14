import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AsyncGetAllUsersActionCreator } from "@/store/users/action";
import { asyncUpdateDepartmentActionCreator } from "@/store/departments/action";
import { asyncGetDepartmentByIDActionCreator } from "@/store/departments/action";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/layout";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "@/components/common/confirm-dialog";
import CategoryHierarchyModal from "../../components/CategoryHierarchyModal";
import {
  getCategoryHierarchies,
  saveCategoryHierarchy,
  deleteCategoryHierarchy,
  type CategoryHierarchiesResponse,
} from "@/services/api/departments";
import { notify } from "@/lib/toast";

export default function UpdateDepartment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users } = useSelector((state: any) => state.users);
  const { id } = useParams();
  const { departmentDetail } = useSelector((state: any) => state.departments);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");

  // Category Hierarchy States
  const [categoryHierarchies, setCategoryHierarchies] = useState<CategoryHierarchiesResponse>({});
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetDepartmentByIDActionCreator(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (departmentDetail && String(departmentDetail.id) === id) {
      setName(departmentDetail.name || "");
      setDepartmentCode(departmentDetail.departmentCode || "");
      setDescription(departmentDetail.description || "");
    }
  }, [departmentDetail, id]);

  useEffect(() => {
    dispatch(AsyncGetAllUsersActionCreator(1, 100, ""));
  }, [dispatch]);

  const handleSave = () => {
    setOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!id) return;

    const payload = {
      name,
      departmentCode,
      description,
      // General hierarchies replaced by category-specific hierarchies
      hierarchies: [],
    };
    try {
      await dispatch(asyncUpdateDepartmentActionCreator(id, payload));
      navigate("/departments");
    } catch (error) {
      console.error("Failed to update department:", error);
    }
  };

  const handleCancel = () => {
    navigate("/departments");
  };

  // ============================================================================
  // Category Hierarchy Handlers
  // ============================================================================

  const fetchCategoryHierarchies = async () => {
    if (!id) return;
    try {
      const data = await getCategoryHierarchies(id);
      setCategoryHierarchies(data || {});
    } catch (error) {
      console.error("Failed to fetch category hierarchies:", error);
    }
  };

  useEffect(() => {
    fetchCategoryHierarchies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddCategoryHierarchy = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategoryHierarchy = (category: string) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategoryHierarchy = async (
    category: string,
    hierarchies: { level: number; userId: number | null }[]
  ) => {
    if (!id) return;
    try {
      const validHierarchies = hierarchies
        .filter((h) => h.userId !== null)
        .map((h) => ({ level: h.level, userId: h.userId as number }));
      
      await saveCategoryHierarchy(id, category, validHierarchies);
      notify.success("Category hierarchy saved successfully");
      fetchCategoryHierarchies();
    } catch (error) {
      console.error("Failed to save category hierarchy:", error);
      notify.error("Failed to save category hierarchy");
    }
  };

  const handleDeleteCategoryHierarchy = async () => {
    if (!id || !deletingCategory) return;
    try {
      await deleteCategoryHierarchy(id, deletingCategory);
      notify.success("Category hierarchy deleted successfully");
      fetchCategoryHierarchies();
      setDeleteConfirmOpen(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error("Failed to delete category hierarchy:", error);
      notify.error("Failed to delete category hierarchy");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      form: "Form",
      standard: "Standard",
      instruksi_kerja: "Work Instructions",
      prosedur: "Prosedur",
      manual_perusahaan: "Manual Company",
      manual_halal: "Manual Halal",
      external: "External",
    };
    return labels[category] || category;
  };


  return (
    <Layout
      title="Update Department"
      items={[
        {
          label: "Home",
          href: "/",
        },
        {
          label: "Departments",
          href: "/departments",
        },
        {
          label: "Update",
          href: `/departments/update/${id}`,
        },
      ]}
    >
      <div className="container mx-auto">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Departments
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Update Department</CardTitle>
            <CardDescription>
              Update department details and hierarchies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    placeholder="Department Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="departmentCode">Department Code</Label>
                  <Input
                    id="departmentCode"
                    placeholder="Department Code"
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Hierarchies Section - Per Document Category */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-between">
                  <div>
                    <Label className="text-base font-semibold">Hierarchies</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure approval hierarchies for each document category.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddCategoryHierarchy}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Document Category
                  </Button>
                </div>

                {Object.keys(categoryHierarchies).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(categoryHierarchies).map(([category, hierarchyList]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between bg-blue-50 p-3 border border-blue-200 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-blue-900">
                            {getCategoryLabel(category)}
                          </div>
                          <div className="text-sm text-blue-700">
                            {hierarchyList.map((h, idx) => (
                              <span key={h.id}>
                                Level {h.level}: {h.user?.fullName}
                                {idx < hierarchyList.length - 1 && " → "}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategoryHierarchy(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeletingCategory(category);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-md text-center">
                    No hierarchies configured yet. Click "Add Category" to set up approval hierarchy for document categories.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSave}>
                  Update Department
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm Update"
        description="Are you sure you want to update this department? This action will save the changes."
        yesText="Update"
        noText="Cancel"
        onYes={handleConfirmUpdate}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Category Hierarchy"
        description={`Are you sure you want to delete the hierarchy for "${deletingCategory ? getCategoryLabel(deletingCategory) : ''}"? This action cannot be undone.`}
        yesText="Delete"
        noText="Cancel"
        onYes={handleDeleteCategoryHierarchy}
      />
      <CategoryHierarchyModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        users={users}
        existingCategories={Object.keys(categoryHierarchies)}
        initialCategory={editingCategory || ""}
        initialHierarchies={
          editingCategory && categoryHierarchies[editingCategory]
            ? categoryHierarchies[editingCategory].map((h) => ({
                level: h.level,
                userId: h.userId,
              }))
            : [{ level: 1, userId: null }]
        }
        onSave={handleSaveCategoryHierarchy}
        isEdit={!!editingCategory}
      />
    </Layout>
  );
}

