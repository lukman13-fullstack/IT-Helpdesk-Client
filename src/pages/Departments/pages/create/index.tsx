import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { asyncCreateDepartmentActionCreator } from "@/store/departments/action";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useState } from "react";
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
import { useNavigate } from "react-router-dom";

export default function CreateDepartment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    const payload = {
      name,
      departmentCode,
      description,
    };
    try {
      await dispatch(asyncCreateDepartmentActionCreator(payload));
      navigate("/departments");
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleCancel = () => {
    navigate("/departments");
  };

  return (
    <Layout
      title="Create Department"
      items={[
        { label: "Home", href: "/" },
        { label: "Departments", href: "/departments" },
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
                <CardTitle className="text-xl">Create New Department</CardTitle>
                <CardDescription>
                  Add a new IT department to the system.
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
                    placeholder="e.g., Infrastructure, Network, Support"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="departmentCode" className="text-sm font-semibold">Department Code</Label>
                  <Input
                    id="departmentCode"
                    placeholder="e.g., INF-01"
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    className="focus-visible:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the department's role"
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 w-32"
                  disabled={!name}
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
