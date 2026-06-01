import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

const schema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password terlalu panjang"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((d) => d.password === d.confirmPassword, { message: "Password tidak cocok", path: ["confirmPassword"] });
type Values = z.infer<typeof schema>;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "", confirmPassword: "" } });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setValidSession(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      else setValidSession(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: v.password });
      if (error) throw error;
      toast.success("Password berhasil diperbarui", { description: "Silakan login dengan password baru Anda." });
      await supabase.auth.signOut();
      navigate("/auth");
    } catch {
      toast.error("Gagal memperbarui password", { description: "Terjadi kesalahan, coba lagi nanti" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/auth" className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary">
              <img src={logoKemenkum} alt="MagangKUM" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">MagangKUM</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">Atur Password Baru</h1>
          <p className="text-muted-foreground mt-2 text-sm">Buat password baru untuk akun Anda.</p>
        </div>
        <div className="card-clean p-8">
          {validSession === false ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive font-medium">Tautan reset tidak valid atau sudah kedaluwarsa.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/forgot-password"><ArrowLeft className="h-4 w-4 mr-2" />Minta Tautan Baru</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Password Baru</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={show ? "text" : "password"} placeholder="Minimal 8 karakter" className="pl-11 pr-11 h-12" {...field} />
                        <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Konfirmasi Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showConfirm ? "text" : "password"} placeholder="Ulangi password" className="pl-11 pr-11 h-12" {...field} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-12 font-semibold" disabled={loading || validSession === null}>
                  {loading ? "Memperbarui..." : "Perbarui Password"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
