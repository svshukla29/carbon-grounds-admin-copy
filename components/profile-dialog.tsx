"use client";

import { useState } from "react";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  FIELD_OFFICER: "Field Officer",
  ANALYST: "Analyst",
  VIEWER: "Viewer",
};

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) setName(user?.name ?? "");
    setCurrentPassword("");
    setNewPassword("");
    onOpenChange(next);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      return toast({ title: "Name cannot be empty", variant: "destructive" });
    }
    setSavingName(true);
    try {
      await usersApi.updateMe({ name: name.trim() });
      updateUser({ name: name.trim() });
      toast({ title: "Profile updated" });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Failed to update profile",
        description: Array.isArray(msg) ? msg.join(", ") : msg,
        variant: "destructive",
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return toast({ title: "Both password fields are required", variant: "destructive" });
    }
    if (newPassword.length < 6) {
      return toast({ title: "New password must be at least 6 characters", variant: "destructive" });
    }
    setSavingPassword(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      toast({ title: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Failed to change password",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Check your current password",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>View your account details and manage your password</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role ? roleLabel[user.role] ?? user.role : ""} disabled />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="profile-name">Full Name</Label>
            <div className="flex gap-2">
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button onClick={handleSaveName} disabled={savingName} className="bg-green-600 hover:bg-green-700 shrink-0">
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Change Password
            </Label>
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              onClick={handleChangePassword}
              disabled={savingPassword}
              variant="outline"
              className="w-full"
            >
              {savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
