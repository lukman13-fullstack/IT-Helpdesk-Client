import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  asyncCreateRoleActionCreator,
  asyncGetAllPermissionsActionCreator,
} from "@/store/roles/action";
import type { RoleCreate } from "@/services/api/types/roles.types";

export default function CreateRole() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { permissions, loading } = useAppSelector((state) => state.roles);

  useEffect(() => {
    dispatch(asyncGetAllPermissionsActionCreator());
  }, [dispatch]);

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleData: RoleCreate = {
      name,
      description: description || undefined,
      permissionIds:
        selectedPermissions.length > 0 ? selectedPermissions : undefined,
    };

    try {
      await dispatch(asyncCreateRoleActionCreator(roleData));
      navigate("/roles");
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  };

  return (
    <Layout
      title="Create Role"
      items={[
        {
          label: "Roles",
          href: "/roles",
        },
      ]}
    >
      <Button variant="ghost" onClick={() => navigate("/roles")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Roles
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Role Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Manager"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for this role..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-3 rounded-lg border p-4 max-h-96 overflow-y-auto">
                  {permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No permissions available
                    </p>
                  ) : (
                    permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          className="cursor-pointer"
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.id)
                          }
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {permission.displayName}
                          </label>
                          {permission.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Selected: {selectedPermissions.length} permission
                {selectedPermissions.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/roles")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name}>
                <Save className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
