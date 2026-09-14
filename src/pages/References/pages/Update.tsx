import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  asyncGetReferenceByIdActionCreator,
  asyncUpdateReferenceActionCreator,
} from "@/store/references/action";
import { AsyncGetAllUsersActionCreator } from "@/store/users/action";
import type { UpdateReferenceData } from "@/services/api/references";

// Reference code options with their full names
const REFERENCE_OPTIONS = [
  { code: "ISO9001", name: "ISO 9001", label: "ISO 9001" },
  { code: "ISO14001", name: "ISO 14001", label: "ISO 14001" },
  { code: "HALAL", name: "Halal (SJPH)", label: "Halal (SJPH)" },
];

export default function UpdateReference() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [checkerId, setCheckerId] = useState<string>("");
  const [openChecker, setOpenChecker] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { referenceDetail } = useAppSelector((state) => state.references);
  const { users, loading: usersLoading } = useAppSelector(
    (state) => state.users
  );

  useEffect(() => {
    if (id) {
      dispatch(asyncGetReferenceByIdActionCreator(id)).then(() => {
        setIsLoading(false);
      });
    }
    dispatch(AsyncGetAllUsersActionCreator(1, 100, ""));
  }, [dispatch, id]);

  useEffect(() => {
    if (referenceDetail) {
      setCode(referenceDetail.code);
      setDescription(referenceDetail.description || "");
      setCheckerId(referenceDetail.checkerId?.toString() || "");
      setIsActive(referenceDetail.isActive);
    }
  }, [referenceDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);

    // Get the name from the selected code
    const selectedRef = REFERENCE_OPTIONS.find((r) => r.code === code);
    const name = selectedRef?.name || code;

    const referenceData: UpdateReferenceData = {
      name,
      code,
      description: description || undefined,
      checkerId: checkerId ? parseInt(checkerId) : null,
      isActive,
    };

    try {
      await dispatch(asyncUpdateReferenceActionCreator(id, referenceData));
      navigate("/references");
    } catch (error) {
      console.error("Failed to update reference:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Update Reference">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Update Reference"
      items={[
        {
          label: "References",
          href: "/references",
        },
      ]}
    >
      <Button variant="ghost" onClick={() => navigate("/references")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to References
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Update Document Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Reference Code <span className="text-destructive">*</span>
                </Label>
                <Select value={code} onValueChange={setCode}>
                  <SelectTrigger id="code">
                    <SelectValue placeholder="Select reference code" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERENCE_OPTIONS.map((ref) => (
                      <SelectItem key={ref.code} value={ref.code}>
                        {ref.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the applicable reference standard
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for this reference..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checker">Checker (Approver)</Label>
              {usersLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading users...
                </div>
              ) : (
                <Popover open={openChecker} onOpenChange={setOpenChecker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openChecker}
                      className="w-full justify-between font-normal bg-background text-foreground hover:bg-background hover:text-foreground"
                    >
                      {checkerId
                        ? users.find((user) => user.id.toString() === checkerId)?.fullName || "Unknown User"
                        : "No checker assigned"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search checker..." />
                      <CommandList>
                        <CommandEmpty>No checker found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="No checker assigned"
                            onSelect={() => {
                              setCheckerId("");
                              setOpenChecker(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !checkerId ? "opacity-100" : "opacity-0"
                              )}
                            />
                            No checker assigned
                          </CommandItem>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.fullName} ${user.email || ""}`}
                              onSelect={() => {
                                setCheckerId(user.id.toString());
                                setOpenChecker(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  checkerId === user.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {user.fullName} {user.email ? `(${user.email})` : ""}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              <p className="text-xs text-muted-foreground">
                The checker will receive notifications when documents with this
                reference are submitted.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
              <span className="text-xs text-muted-foreground ml-2">
                (Inactive references won't appear in document creation form)
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/references")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !code}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Reference
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
