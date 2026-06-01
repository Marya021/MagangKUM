import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, RefreshCw, ShieldCheck } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

import { authSchema, type AuthValues } from "./schemas";
import { highlights } from "./constants";

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCaptcha = () => Array.from({ length: 5 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");

function CaptchaCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // background
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
    ctx.fillStyle = `hsl(${bg})`;
    ctx.fillRect(0, 0, w, h);

    // noise dots
    const fg = getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim();
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `hsl(${fg} / ${Math.random() * 0.4 + 0.1})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // lines
    const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `hsl(${primary} / ${Math.random() * 0.4 + 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // characters
    const foreground = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim();
    const charWidth = w / (value.length + 1);
    value.split("").forEach((ch, i) => {
      ctx.save();
      const x = charWidth * (i + 1);
      const y = h / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() - 0.5) * 0.6;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${22 + Math.random() * 6}px ui-monospace, monospace`;
      ctx.fillStyle = `hsl(${foreground})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, [value]);

  return <canvas ref={canvasRef} className="h-12 w-full rounded-md" aria-label="CAPTCHA" />;
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const navigate = useNavigate();

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError(null);
  }, []);

  const form = useForm<AuthValues>({ resolver: zodResolver(authSchema), defaultValues: { email: "", password: "", fullName: "" } });

  const onSubmit = async (values: AuthValues) => {
    if (!isLogin && (!values.fullName || values.fullName.trim().length === 0)) { form.setError("fullName", { message: "Nama lengkap wajib diisi" }); return; }
    if (captchaInput.trim().length === 0) {
      setCaptchaError("Silakan verifikasi bahwa Anda bukan robot");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setCaptchaError("Kode CAPTCHA tidak sesuai");
      refreshCaptcha();
      return;
    }
    setCaptchaError(null);
    setLoading(true);
    let success = false;
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
        if (error) {
          const msg = error.message.toLowerCase();
          const description = msg.includes("invalid") || msg.includes("credentials") || msg.includes("password") || msg.includes("email")
            ? "Email atau password salah"
            : "Terjadi kesalahan, coba lagi nanti";
          toast.error("Login Gagal", { description });
          return;
        }
        success = true;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { full_name: values.fullName }, emailRedirectTo: window.location.origin } });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
            toast.error("Registrasi Gagal", { description: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." });
          } else if (msg.includes("password") && msg.includes("pwn")) {
            toast.error("Password Tidak Aman", { description: "Password ini pernah bocor di internet. Silakan gunakan password lain." });
          } else {
            toast.error("Registrasi Gagal", { description: "Terjadi kesalahan, coba lagi nanti" });
          }
          return;
        }
        success = true;
        toast.success("Akun berhasil dibuat!", { description: "Cek email Anda untuk konfirmasi akun, atau langsung masuk jika auto-confirm aktif." });
      }
    } catch (error: unknown) {
      toast.error("Terjadi Kesalahan", { description: "Terjadi kesalahan, coba lagi nanti" });
      // eslint-disable-next-line no-console
      console.error("[Auth]", error);
    } finally {
      setLoading(false);
      if (!success) refreshCaptcha();
    }
  };


  const switchMode = () => { setIsLogin(!isLogin); form.reset({ email: "", password: "", fullName: "" }); refreshCaptcha(); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — clean gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-b from-primary to-primary/85 items-center justify-center p-12">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-foreground/5 blur-2xl" />
        <div className="absolute bottom-16 -left-20 h-56 w-56 rounded-full bg-primary-foreground/5 blur-2xl" />
        <div className="relative text-center max-w-md space-y-10">
          <div>
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm mx-auto mb-6">
              <img src={logoKemenkum} alt="MagangKUM" className="h-12 w-12 object-contain" />
            </div>
            <h2 className="text-4xl font-extrabold text-primary-foreground tracking-tight">MagangKUM</h2>
            <p className="text-lg text-primary-foreground/70 mt-2">Platform Magang Resmi Kemenkum Riau</p>
          </div>
          <div className="flex gap-8 justify-center">
            {[{ value: "500+", label: "Posisi" }, { value: "2K+", label: "Pelamar" }, { value: "95%", label: "Kepuasan" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">{s.value}</div>
                <div className="text-sm text-primary-foreground/60">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-center gap-4 bg-primary-foreground/10 rounded-xl p-4 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <h.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-primary-foreground">{h.title}</div>
                  <div className="text-xs text-primary-foreground/60">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary">
                <img src={logoKemenkum} alt="MagangKUM" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-xl font-bold text-foreground">MagangKUM</span>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{isLogin ? "Selamat Datang 👋" : "Buat Akun Baru"}</h1>
            <p className="text-muted-foreground mt-2 text-base">{isLogin ? "Masuk ke akun untuk melanjutkan ke dashboard" : "Daftar untuk mulai melamar program magang"}</p>
          </div>
          <div className="card-clean p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {!isLogin && (
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Nama Lengkap</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Masukkan nama lengkap" className="pl-11 h-12 text-base" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="anda@contoh.com" className="pl-11 h-12 text-base" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-semibold">Kata Sandi</FormLabel>
                      {isLogin && (
                        <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline underline-offset-4">
                          Lupa Password?
                        </Link>
                      )}
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-11 pr-11 h-12 text-base" {...field} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* CAPTCHA */}
                <div className="space-y-2">
                  <FormLabel className="text-sm font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Verifikasi CAPTCHA
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border border-input bg-muted overflow-hidden select-none">
                      <CaptchaCanvas value={captcha} />
                    </div>
                    <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" onClick={refreshCaptcha} aria-label="Refresh CAPTCHA">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    type="text"
                    placeholder="Masukkan kode di atas"
                    className="h-12 text-base tracking-widest font-mono uppercase"
                    value={captchaInput}
                    onChange={(e) => { setCaptchaInput(e.target.value); if (captchaError) setCaptchaError(null); }}
                    maxLength={5}
                    autoComplete="off"
                  />
                  {captchaError && <p className="text-sm font-medium text-destructive">{captchaError}</p>}
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                  {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar Sekarang"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>
            <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm">
              <span className="text-muted-foreground">{isLogin ? "Belum punya akun? " : "Sudah punya akun? "}</span>
              <button onClick={switchMode} className="text-primary font-semibold hover:underline underline-offset-4">{isLogin ? "Daftar Sekarang" : "Masuk"}</button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi MagangKUM.</p>
        </div>
      </div>
    </div>
  );
}
