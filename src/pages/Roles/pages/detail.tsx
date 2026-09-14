import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import {
  asyncGetRoleByIdActionCreator,
  asyncDeleteRoleActionCreator,
} from "@/store/roles/action";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { convertSnakeToReadable } from "@/lib/convertSnakeToReadable";
import { useLanguage } from "@/context/LanguageContext";

export default function RoleDetail() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { roleDetail, loading } = useAppSelector((state) => state.roles);
  console.log(roleDetail);

  useEffect(() => {
    if (id) {
      dispatch(asyncGetRoleByIdActionCreator(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (id) {
      try {
        await dispatch(asyncDeleteRoleActionCreator(id));
        navigate("/roles");
      } catch (error) {
        console.error("Failed to delete role:", error);
      }
    }
  };

  if (loading && !roleDetail) {
    return (
      <Layout title={t("sidebar.roles")}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!roleDetail) {
    return (
      <Layout title={t("sidebar.roles")}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Role not found</p>
            <Button
              onClick={() => navigate("/roles")}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roles
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title={t("sidebar.roles")}
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
          <div className="flex items-center justify-between">
            <CardTitle>{roleDetail.name}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/roles/update/${roleDetail.id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-sm">
                {roleDetail.description || (
                  <span className="text-muted-foreground italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Created At
                </h3>
                <p className="text-sm">
                  {new Date(roleDetail.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Updated At
                </h3>
                <p className="text-sm">
                  {new Date(roleDetail.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                Permissions ({roleDetail.permissions?.length || 0})
              </h3>
            </div>
            {!roleDetail.permissions || roleDetail.permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No permissions assigned to this role
              </p>
            ) : (
              <div className="grid gap-2">
                {roleDetail.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Badge variant="success" className="mt-0.5">
                      {convertSnakeToReadable(permission.name)}
                    </Badge>
                    {permission.description && (
                      <p className="text-sm flex-1">{permission.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                Users ({roleDetail.users?.length || 0})
              </h3>
            </div>
            {!roleDetail.users || roleDetail.users.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No users assigned to this role
              </p>
            ) : (
              <div className="grid gap-2">
                {roleDetail.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username} • {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onYes={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${roleDetail.name}"? This action cannot be undone.`}
        yesText="Delete"
        noText="Cancel"
      />
    </Layout>
  );
}
