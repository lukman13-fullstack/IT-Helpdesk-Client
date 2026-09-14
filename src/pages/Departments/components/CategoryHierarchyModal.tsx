import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";

const DOCUMENT_CATEGORIES = [
  { value: "form", label: "Form" },
  { value: "standard", label: "Standard" },
  { value: "instruksi_kerja", label: "Work Instructions" },
  { value: "prosedur", label: "Prosedur" },
  { value: "manual_perusahaan", label: "Manual Company" },
  { value: "manual_halal", label: "Manual Halal" },
  { value: "external", label: "External" },
];

interface CategoryHierarchyItem {
  level: number;
  userId: number | null;
}

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface CategoryHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  existingCategories: string[];
  initialCategory?: string;
  initialHierarchies?: CategoryHierarchyItem[];
  onSave: (category: string, hierarchies: CategoryHierarchyItem[]) => void;
  isEdit?: boolean;
}

export default function CategoryHierarchyModal({
  open,
  onOpenChange,
  users,
  existingCategories,
  initialCategory = "",
  initialHierarchies = [{ level: 1, userId: null }],
  onSave,
  isEdit = false,
}: CategoryHierarchyModalProps) {
  const [category, setCategory] = useState(initialCategory);
  const [hierarchies, setHierarchies] = useState<CategoryHierarchyItem[]>(initialHierarchies);
  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>({});
  const [selectedUsers, setSelectedUsers] = useState<{
    [key: number]: { id: number; fullName: string } | null;
  }>({});

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setCategory(initialCategory);
      setHierarchies(initialHierarchies.length > 0 ? initialHierarchies : [{ level: 1, userId: null }]);
      
      // Initialize selectedUsers from initialHierarchies
      const usersMap: { [key: number]: { id: number; fullName: string } | null } = {};
      initialHierarchies.forEach((h, index) => {
        if (h.userId) {
          const user = users.find((u) => u.id === h.userId);
          if (user) {
            usersMap[index] = { id: user.id, fullName: user.fullName };
          }
        }
      });
      setSelectedUsers(usersMap);
    }
  }, [open, initialCategory, initialHierarchies, users]);

  const handleAddLevel = () => {
    const newLevel = hierarchies.length + 1;
    setHierarchies([...hierarchies, { level: newLevel, userId: null }]);
  };

  const handleRemoveLevel = (index: number) => {
    const newHierarchies = hierarchies.filter((_, i) => i !== index);
    const reindexed = newHierarchies.map((h, i) => ({
      ...h,
      level: i + 1,
    }));
    setHierarchies(reindexed);
    
    // Reindex selectedUsers
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
    const selectedUser = users.find((user) => user.id === userId);
    
    const newHierarchies = [...hierarchies];
    newHierarchies[index].userId = userId;
    setHierarchies(newHierarchies);
    
    if (selectedUser) {
      setSelectedUsers((prev) => ({
        ...prev,
        [index]: { id: selectedUser.id, fullName: selectedUser.fullName },
      }));
    }
    
    setOpenPopovers((prev) => ({ ...prev, [index]: false }));
  };

  const handleSave = () => {
    if (!category) return;
    
    const validHierarchies = hierarchies.filter((h) => h.userId !== null);
    if (validHierarchies.length === 0) return;
    
    onSave(category, validHierarchies);
    onOpenChange(false);
  };

  const availableCategories = DOCUMENT_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat.value) || cat.value === initialCategory
  );

  const isValid = category && hierarchies.some((h) => h.userId !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category Hierarchy" : "Add Category Hierarchy"}
          </DialogTitle>
          <DialogDescription>
            Configure approval hierarchy for a specific document category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Document Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Approval Levels</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddLevel}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Level
              </Button>
            </div>

            {hierarchies.map((hierarchy, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-slate-50 p-3 border rounded-md"
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
                            users.find((user) => user.id === hierarchy.userId)
                              ?.fullName ||
                            "Select user..."
                          : "Select user..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0">
                      <Command>
                        <CommandInput placeholder="Search user..." />
                        <CommandList>
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.fullName} ${user.email}`}
                                onSelect={() => handleUserChange(index, user.id)}
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
                    onClick={() => handleRemoveLevel(index)}
                    className="flex-shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {isEdit ? "Update" : "Add"} Category Hierarchy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
