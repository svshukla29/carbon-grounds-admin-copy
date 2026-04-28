"use client";

import { useState } from "react";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AddUserDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "ANALYST", label: "Analyst" },
  { value: "VIEWER", label: "Viewer" },
];

export function AddUserDialog({ children, onSuccess }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast({
        title: "Missing fields",
        description: "Name, email and password are required.",
        variant: "destructive",
      });
      return;
    }
    if (form.password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await usersApi.create({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast({ title: `User "${form.name}" created successfully!` });
      setForm({ name: "", email: "", password: "", role: "VIEWER" });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast({
        title: "Failed to create user",
        description: Array.isArray(msg)
          ? msg.join(", ")
          : msg ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="bg-green-600 hover:bg-green-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new admin dashboard user. They can log in immediately
              with the credentials you set.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="rahul@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admin — full access · Project Manager — manage projects &
                reports · Analyst — view & create reports · Viewer — read only
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
