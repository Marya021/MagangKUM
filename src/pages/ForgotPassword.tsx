import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

const schema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Masukkan email yang valid").max(255),
});
type Values = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(v.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Email terkirim", { description: "Cek inbox Anda untuk tautan reset password." });
    } catch {
      toast.error("Gagal mengirim email", { description: "Terjadi kesalahan, coba lagi nanti" });
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
          <h1 className="text-2xl font-extrabold text-foreground">Lupa Password?</h1>
          <p className="text-muted-foreground mt-2 text-sm">Masukkan email Anda dan kami akan mengirim tautan untuk reset password.</p>
        </div>
        <div className="card-clean p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Periksa Email Anda</h2>
              <p className="text-sm text-muted-foreground">Jika email terdaftar, Anda akan menerima tautan reset password dalam beberapa menit.</p>
              <Button asChild variant="outline" className="w-full"><Link to="/auth"><ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Login</Link></Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="anda@contoh.com" className="pl-11 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Tautan Reset"}
                </Button>
                <Link to="/auth" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />Kembali ke Login
                </Link>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
