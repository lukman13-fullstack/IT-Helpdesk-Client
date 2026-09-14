import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AsyncAddUserActionCreator } from "@/store/users/action";
import { asyncGetDepartmentsActionCreator } from "@/store/departments/action";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { asyncGetRolesActionCreator } from "@/store/roles/action";

export default function CreateUser() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { departments } = useSelector((state: any) => state.departments);
  const { roles } = useSelector((state: any) => state.roles);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [position, setPosition] = useState("");

  const [openPopovers, setOpenPopovers] = useState({
    department: false,
    role: false,
  });

  const [searchQueries, setSearchQueries] = useState({
    department: "",
    role: "",
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDepartments = useCallback(
    (searchQuery: string = "") => {
      dispatch(asyncGetDepartmentsActionCreator(1, 100, searchQuery));
    },
    [dispatch]
  );

  const fetchRoles = useCallback(
    (searchQuery: string = "") => {
      dispatch(
        asyncGetRolesActionCreator({ page: 1, limit: 100, search: searchQuery })
      );
    },
    [dispatch]
  );

  const handleSearchChange = (type: "department" | "role", value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [type]: value,
    }));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (type === "department") {
        fetchDepartments(value);
      } else {
        fetchRoles(value);
      }
    }, 300);
  };

  const handleDepartmentChange = (id: number) => {
    setDepartmentIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((deptId) => deptId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const removeDepartment = (id: number) => {
    setDepartmentIds((prev) => prev.filter((deptId) => deptId !== id));
  };

  const handleRoleChange = (id: number) => {
    setRoleId(id);
    setOpenPopovers((prev) => ({ ...prev, role: false }));
  };

  useEffect(() => {
    fetchDepartments("");
    fetchRoles("");
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchDepartments, fetchRoles]);

  const handleSave = async () => {
    const payload = {
      username,
      fullName,
      departmentIds,
      password,
      email,
      roleId,
      position: position.trim() || null,
    };
    try {
      const response = await dispatch(AsyncAddUserActionCreator(payload));
      if (response.status === "success") {
        navigate("/users");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Layout
      title="Create User"
      items={[
        {
          label: "Home",
          href: "/",
        },
        {
          label: "Users",
          href: "/users",
        },
      ]}
    >
      <div className="container mx-auto">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new user to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g. Manager, Staff, Supervisor"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                {/* <div className="flex flex-col gap-2">
                  <Label htmlFor="roleId">Role ID</Label>
                  <Input
                    id="roleId"
                    placeholder="Role ID"
                    value={roleId || ""}
                    onChange={(e) => setRoleId(parseInt(e.target.value))}
                  />
                </div> */}
                <div className="flex flex-col gap-2">
                  <Label>Role</Label>
                  <Popover
                    open={openPopovers.role || false}
                    onOpenChange={(open) => {
                      setOpenPopovers((prev) => ({
                        ...prev,
                        role: open,
                      }));
                      if (!open) {
                        setSearchQueries((prev) => ({
                          ...prev,
                          role: "",
                        }));
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPopovers.role || false}
                        className="w-full justify-between"
                      >
                        {roleId
                          ? roles.find((r: any) => r.id === roleId)?.name ||
                            "Select role..."
                          : "Select role..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search role..."
                          value={searchQueries.role || ""}
                          onValueChange={(value) =>
                            handleSearchChange("role", value)
                          }
                        />
                        <CommandList>
                          <CommandEmpty>No role found.</CommandEmpty>
                          <CommandGroup>
                            {roles.map((role: any) => (
                              <CommandItem
                                key={role.id}
                                value={`${role.name}`}
                                onSelect={() => {
                                  handleRoleChange(role.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    roleId === role.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {role.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {role.description || "N/A"}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Departments</Label>
                  <Popover
                    open={openPopovers.department || false}
                    onOpenChange={(open) => {
                      setOpenPopovers((prev) => ({
                        ...prev,
                        department: open,
                      }));
                      if (!open) {
                        setSearchQueries((prev) => ({
                          ...prev,
                          department: "",
                        }));
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPopovers.department || false}
                        className="w-full justify-between"
                      >
                        {departmentIds.length > 0
                          ? `${departmentIds.length} department(s) selected`
                          : "Select departments..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search department..."
                          value={searchQueries.department || ""}
                          onValueChange={(value) =>
                            handleSearchChange("department", value)
                          }
                        />
                        <CommandList>
                          <CommandEmpty>No department found.</CommandEmpty>
                          <CommandGroup>
                            {departments.map((department: any) => (
                              <CommandItem
                                key={department.id}
                                value={`${department.name}`}
                                onSelect={() => {
                                  handleDepartmentChange(department.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    departmentIds.includes(department.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {department.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {department.departmentCode || "N/A"}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {departmentIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {departmentIds.map((id) => {
                        const dept = departments.find((d: any) => d.id === id);
                        return dept ? (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {dept.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeDepartment(id)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSave}>
                  Save Department
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
