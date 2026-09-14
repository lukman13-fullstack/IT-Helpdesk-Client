import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AsyncGetAllUsersActionCreator } from "@/store/users/action";
import { asyncCreateDepartmentActionCreator } from "@/store/departments/action";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
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

interface Hierarchy {
  level: number;
  userId: number | null;
}

export default function CreateDepartment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users } = useSelector((state: any) => state.users);

  const [name, setName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");
  const [hierarchies, setHierarchies] = useState<Hierarchy[]>([
    { level: 1, userId: null },
  ]);

  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>(
    {}
  );

  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {}
  );

  // Store selected user info for each hierarchy level to prevent losing names during search
  const [selectedUsers, setSelectedUsers] = useState<{
    [key: number]: { id: number; fullName: string } | null;
  }>({});

  useEffect(() => {
    dispatch(AsyncGetAllUsersActionCreator(1, 100, ""));
  }, [dispatch]);

  useEffect(() => {
    const timers: { [key: number]: NodeJS.Timeout } = {};

    Object.keys(searchQueries).forEach((indexStr) => {
      const index = parseInt(indexStr);
      const query = searchQueries[index];

      if (query !== undefined) {
        timers[index] = setTimeout(() => {
          console.log(
            `Searching users with query: "${query}" for level ${index}`
          );
          dispatch(AsyncGetAllUsersActionCreator(1, 100, query));
        }, 500);
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, [searchQueries, dispatch]);

  const handleAddHierarchy = () => {
    const newLevel = hierarchies.length + 1;
    setHierarchies([...hierarchies, { level: newLevel, userId: null }]);
  };

  const handleRemoveHierarchy = (index: number) => {
    const newHierarchies = hierarchies.filter((_, i) => i !== index);
    const reindexed = newHierarchies.map((h, i) => ({
      ...h,
      level: i + 1,
    }));
    setHierarchies(reindexed);
    
    // Also reindex selectedUsers
    setSelectedUsers((prev) => {
      const newSelectedUsers: { [key: number]: { id: number; fullName: string } | null } = {};
      let newIndex = 0;
      for (let i = 0; i < hierarchies.length; i++) {
        if (i !== index) {
          newSelectedUsers[newIndex] = prev[i] || null;
          newIndex++;
        }
      }
      return newSelectedUsers;
    });
  };

  const handleUserChange = (index: number, userId: number) => {
    // Find the selected user to store their info
    const selectedUser = users.find((user: any) => user.id === userId);
    
    const newHierarchies = [...hierarchies];
    newHierarchies[index].userId = userId;
    setHierarchies(newHierarchies);
    
    // Store selected user info so it persists even when users list changes during search
    if (selectedUser) {
      setSelectedUsers((prev) => ({
        ...prev,
        [index]: { id: selectedUser.id, fullName: selectedUser.fullName },
      }));
    }
    
    setOpenPopovers((prev) => ({ ...prev, [index]: false }));
    setSearchQueries((prev) => {
      const newQueries = { ...prev };
      delete newQueries[index];
      return newQueries;
    });
  };

  const handleSearchChange = (index: number, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [index]: value }));
  };

  const handleSave = async () => {
    const payload = {
      name,
      departmentCode,
      description,
      hierarchies: hierarchies
        .filter((h) => h.userId !== null)
        .map((h) => ({
          level: h.level,
          userId: h.userId,
        })),
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
      <div className="container mx-auto">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Departments
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Department</CardTitle>
            <CardDescription>
              Add a new department with hierarchies to the system.
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

              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-between">
                  <Label>Hierarchies</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddHierarchy}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Level
                  </Button>
                </div>

                {hierarchies.map((hierarchy, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white p-3 border rounded-md"
                  >
                    <div className="flex-shrink-0 w-16">
                      <Label className="text-xs">Level {hierarchy.level}</Label>
                    </div>
                    <div className="flex-1">
                      <Popover
                        open={openPopovers[index] || false}
                        onOpenChange={(open) => {
                          setOpenPopovers((prev) => ({
                            ...prev,
                            [index]: open,
                          }));
                          // Reset search when closing
                          if (!open) {
                            setSearchQueries((prev) => {
                              const newQueries = { ...prev };
                              delete newQueries[index];
                              return newQueries;
                            });
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPopovers[index] || false}
                            className="w-full justify-between"
                          >
                            {hierarchy.userId
                              ? selectedUsers[index]?.fullName ||
                                users.find(
                                  (user: any) => user.id === hierarchy.userId
                                )?.fullName ||
                                "Select user..."
                              : "Select user..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search user..."
                              value={searchQueries[index] || ""}
                              onValueChange={(value) =>
                                handleSearchChange(index, value)
                              }
                            />
                            <CommandList>
                              <CommandEmpty>No user found.</CommandEmpty>
                              <CommandGroup>
                                {users.map((user: any) => (
                                  <CommandItem
                                    key={user.id}
                                    value={`${user.fullName} ${user.email}`}
                                    onSelect={() => {
                                      console.log(
                                        "User selected via onSelect:",
                                        user.id
                                      );
                                      handleUserChange(index, user.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        hierarchy.userId === user.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {user.fullName}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {user.email}
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
                    {hierarchies.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveHierarchy(index)}
                        className="flex-shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
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
