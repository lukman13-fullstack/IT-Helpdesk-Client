import Layout from "@/components/layout/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AsyncGetUserDetailActionCreator } from "@/store/users/action";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function UserDetail() {
  const { usersDetail } = useAppSelector((state: any) => state.users);
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!id) return;
    dispatch(AsyncGetUserDetailActionCreator(Number(id)));
  }, [dispatch, id]);

  return (
    <Layout
      title="User Detail"
      items={[
        { label: "Home", href: "/" },
        { label: "Users", href: "/users" },
      ]}
    >
      <div className="container mx-auto space-y-4">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        {usersDetail && (
          <Card className="p-5">
            <CardHeader>
              <CardTitle>User Detail</CardTitle>
              <CardDescription>
                Detailed information about the user
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={usersDetail?.username || ""}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={usersDetail?.fullName || ""}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={usersDetail?.email || ""}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role ID</Label>
                <Input
                  id="role"
                  value={usersDetail?.role?.name || ""}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={usersDetail?.position || "-"}
                  readOnly
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Departments</Label>
                <div className="flex items-center py-2 flex-wrap gap-2 border border-outline rounded-full px-3">
                  {usersDetail?.departments?.length > 0 ? (
                    usersDetail.departments.map((dept: any) => (
                      <Badge key={dept.department.id} variant="secondary">
                        {dept.department.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">No departments assigned</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdAt">Created At</Label>
                <Input
                  id="createdAt"
                  value={formatDate(usersDetail?.createdAt)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="updatedAt">Last Updated</Label>
                <Input
                  id="updatedAt"
                  value={formatDate(usersDetail?.updatedAt)}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
