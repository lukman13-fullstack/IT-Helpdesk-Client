import { asyncGetDepartmentByIDActionCreator } from "@/store/departments/action";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DepartmentDetailPage() {
  const dispatch = useAppDispatch();
  const { departmentDetail } = useAppSelector((state) => state.departments);
  const { id } = useParams();

  useEffect(() => {
    dispatch(asyncGetDepartmentByIDActionCreator(id as string));
  }, [dispatch, id]);

  console.log(departmentDetail);
  return (
    <Layout
      title={departmentDetail?.name}
      items={[
        {
          label: "Home",
          href: "/",
        },
        {
          label: "Departments",
          href: "/departments",
        },
      ]}
    >
      <div className="max-w-4xl flex flex-col gap-4 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {departmentDetail?.name}
            </CardTitle>
            {departmentDetail?.description && (
              <p className="text-muted-foreground">
                {departmentDetail?.description}
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Hierarchies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentDetail?.hierarchies?.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <Badge variant="secondary">Level {h.level}</Badge>
                    </TableCell>
                    <TableCell>{h.user?.fullName || "Unknown"}</TableCell>
                    <TableCell>{h.user?.email || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Users in Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentDetail?.users && departmentDetail.users.length > 0 ? (
              departmentDetail.users.map((u: any, index: number) => (
                <div
                  key={index}
                  className="p-3 border rounded-md flex flex-col bg-white shadow-sm"
                >
                  <span className="font-medium">{u.user.fullName}</span>
                  <span className="text-sm text-muted-foreground">
                    {u.user.email}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No users found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
