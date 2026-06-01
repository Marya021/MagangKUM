import { AuthForm } from "@/features/auth/Auth";
import { SEO } from "@/components/SEO";

export default function Auth() {
  return (
    <>
      <SEO title="Masuk / Daftar | MagangKUM" description="Masuk atau daftar akun MagangKUM untuk melamar program magang resmi Kementerian Hukum Riau." />
      <AuthForm />
    </>
  );
}
