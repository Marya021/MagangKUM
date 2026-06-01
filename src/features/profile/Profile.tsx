import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Camera, Save, Lock, Eye, EyeOff } from "lucide-react";

import { profileSchema, passwordSchema, type ProfileValues, type PasswordValues } from "./schemas";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { useProfileQuery, useUpdateProfile, useUploadAvatar, useChangePassword } from "./hooks";

export function ProfileContent() {
  const { user, role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { data: profile, isLoading } = useProfileQuery(user?.id);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { full_name: profile?.full_name ?? "", asal: profile?.asal ?? "", jurusan: profile?.jurusan ?? "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const updateProfileMutation = useUpdateProfile(user?.id, {
    onSuccess: () => toast.success("Profil berhasil diperbarui"),
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui profil"),
  });

  const uploadAvatarMutation = useUploadAvatar(user?.id, {
    onSuccess: () => toast.success("Avatar berhasil diperbarui"),
    onError: (e: Error) => toast.error(e.message || "Gagal mengunggah avatar"),
  });

  const changePasswordMutation = useChangePassword({
    onSuccess: () => { passwordForm.reset(); toast.success("Password berhasil diubah"); },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah password"),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran file maksimal 2MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Hanya file JPG, PNG, dan WebP yang diterima"); return; }
    uploadAvatarMutation.mutate(file);
  };

  const initials = (profile?.full_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi akun Anda</p>
      </div>

      <Card className="card-clean">
        <CardHeader><CardTitle>Informasi Profil</CardTitle><CardDescription>Perbarui nama dan foto profil Anda</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadAvatarMutation.isPending} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Camera className="h-6 w-6 text-white" /></button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{uploadAvatarMutation.isPending ? "Mengunggah..." : "Klik foto untuk mengganti avatar"}</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP. Maks 2MB.</p>
            </div>
          </div>
          <Separator />
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit((v) => updateProfileMutation.mutate(v))} className="space-y-4">
              <FormField control={profileForm.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="Nama lengkap Anda" {...field} /></FormControl><FormMessage /></FormItem>)} />
              {role !== "supervisor" && role !== "reviewer" && role !== "admin" && (
                <>
                  <FormField control={profileForm.control} name="asal" render={({ field }) => (<FormItem><FormLabel>Asal Sekolah / Kampus</FormLabel><FormControl><Input placeholder="Contoh: SMKN 2 Bukittinggi / UNRI" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={profileForm.control} name="jurusan" render={({ field }) => (<FormItem><FormLabel>Jurusan</FormLabel><FormControl><Input placeholder="Contoh: Akuntansi / Hukum" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input value={user?.email ?? ""} disabled className="mt-1.5 bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
              </div>
              <Button type="submit" disabled={updateProfileMutation.isPending}><Save className="h-4 w-4 mr-2" />{updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Data"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="card-clean">
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Ubah Password</CardTitle><CardDescription>Pastikan password baru Anda aman dan mudah diingat</CardDescription></CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit((v) => changePasswordMutation.mutate(v))} className="space-y-4">
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem><FormLabel>Password Baru</FormLabel><FormControl>
                  <div className="relative">
                    <Input type={showNewPw ? "text" : "password"} placeholder="Minimal 6 karakter" {...field} />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Konfirmasi Password</FormLabel><FormControl>
                  <div className="relative">
                    <Input type={showConfirmPw ? "text" : "password"} placeholder="Ulangi password baru" {...field} />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={changePasswordMutation.isPending} variant="outline"><Lock className="h-4 w-4 mr-2" />{changePasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
