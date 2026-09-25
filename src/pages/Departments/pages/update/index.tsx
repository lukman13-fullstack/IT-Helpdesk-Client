import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { asyncUpdateDepartmentActionCreator } from "@/store/departments/action";
import { asyncGetDepartmentByIDActionCreator } from "@/store/departments/action";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { ArrowLeft, Building } from "lucide-react";
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

export default function UpdateDepartment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { departmentDetail } = useSelector((state: any) => state.departments);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");

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

  const handleSave = () => {
    setOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!id) return;

    const payload = {
      name,
      departmentCode,
      description,
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

  return (
    <Layout
      title="Update Department"
      items={[
        { label: "Home", href: "/" },
        { label: "Departments", href: "/departments" },
        { label: "Update", href: `/departments/update/${id}` },
      ]}
    >
      <div className="container mx-auto max-w-3xl">
        <Button variant="ghost" onClick={handleCancel} className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Departments
        </Button>

        <Card className="border-border/50 shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Update Department</CardTitle>
                <CardDescription>
                  Modify department details in the system.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Department Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Department Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="departmentCode" className="text-sm font-semibold">Department Code</Label>
                  <Input
                    id="departmentCode"
                    placeholder="Department Code"
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-2">
                <Button variant="outline" onClick={handleCancel} className="w-24">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 w-36"
                  disabled={!name}
                >
                  Update
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
    </Layout>
  );
}
