import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const userFormSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string(),
  role: z.enum(["admin", "reviewer"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "reviewer";
}

interface EditUserData {
  userId: string;
  fullName: string;
  email: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  editData?: EditUserData | null;
  onSubmitAdd: (data: UserFormData) => void;
  onSubmitEdit: (data: { userId: string; fullName: string; email: string }) => void;
  loading: boolean;
}

export function UserFormDialog({ open, onOpenChange, mode, editData, onSubmitAdd, onSubmitEdit, loading }: UserFormDialogProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "reviewer" },
  });

  useEffect(() => {
    if (mode === "edit" && editData) {
      form.reset({ fullName: editData.fullName, email: editData.email, password: "", role: "reviewer" });
    } else if (mode === "add") {
      form.reset({ fullName: "", email: "", password: "", role: "reviewer" });
    }
  }, [mode, editData, open]);

  const onSubmit = (values: UserFormValues) => {
    if (mode === "add") {
      onSubmitAdd({ fullName: values.fullName, email: values.email, password: values.password, role: values.role });
    } else if (editData) {
      onSubmitEdit({ userId: editData.userId, fullName: values.fullName, email: values.email });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Tambah Pengguna" : "Edit Pengguna"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl><Input placeholder="Nama lengkap" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="email@contoh.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {mode === "add" && (
              <>
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Minimal 6 karakter" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="reviewer">Peninjau</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : mode === "add" ? "Tambah" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
