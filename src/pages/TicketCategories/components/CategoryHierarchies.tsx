import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, ChevronRight, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface HierarchyItem {
  id?: number;
  name: string;
  description: string;
  children: HierarchyItem[];
}

interface Props {
  hierarchies: HierarchyItem[];
  onChange: (hierarchies: HierarchyItem[]) => void;
}

const CategoryHierarchies: React.FC<Props> = ({ hierarchies, onChange }) => {
  const handleAddTopLevel = () => {
    onChange([...hierarchies, { name: "", description: "", children: [] }]);
  };

  const updateItem = (
    path: number[],
    field: keyof HierarchyItem,
    value: any,
  ) => {
    const newHierarchies = JSON.parse(JSON.stringify(hierarchies)); // deep clone
    let current = newHierarchies;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children;
    }
    current[path[path.length - 1]][field] = value;
    onChange(newHierarchies);
  };

  const addChild = (path: number[]) => {
    const newHierarchies = JSON.parse(JSON.stringify(hierarchies));
    let current = newHierarchies;
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        if (!current[path[i]].children) current[path[i]].children = [];
        current[path[i]].children.push({
          name: "",
          description: "",
          children: [],
        });
      } else {
        current = current[path[i]].children;
      }
    }
    onChange(newHierarchies);
  };

  const removeItem = (path: number[]) => {
    const newHierarchies = JSON.parse(JSON.stringify(hierarchies));
    if (path.length === 1) {
      newHierarchies.splice(path[0], 1);
    } else {
      let current = newHierarchies;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]].children;
      }
      current.splice(path[path.length - 1], 1);
    }
    onChange(newHierarchies);
  };

  const renderNode = (node: HierarchyItem, path: number[], level: number) => {
    return (
      <div key={path.join("-")} className="mt-4">
        <div className="flex gap-4 items-start p-4 border rounded-xl bg-card relative group">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded text-xs">
                Level {level}
              </span>
              <Label>Sub Category Name</Label>
            </div>
            <Input
              value={node.name}
              onChange={(e) => updateItem(path, "name", e.target.value)}
              placeholder="e.g. Printer / Monitor"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-50 hover:text-red-600 mt-8"
            onClick={() => removeItem(path)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>

        <div className="pl-6 border-l-2 border-primary/20 ml-6 mt-2">
          {node.children &&
            node.children.map((child, index) =>
              renderNode(child, [...path, index], level + 1),
            )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-dashed"
            onClick={() => addChild(path)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Sub-Category (Level{" "}
            {level + 1})
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 border-t pt-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sub Categories</h3>
          <p className="text-sm text-muted-foreground">
            Manage nested sub-categories dynamically
          </p>
        </div>
        <Button type="button" onClick={handleAddTopLevel} variant="secondary">
          <Plus className="w-4 h-4 mr-2" /> Add Sub Category
        </Button>
      </div>

      <div className="space-y-2">
        {hierarchies.map((item, index) => renderNode(item, [index], 1))}

        {hierarchies.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground">
            No sub categories added. Click the button above to start building
            the hierarchy.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHierarchies;
