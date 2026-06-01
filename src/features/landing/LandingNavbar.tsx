import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sun, Moon, LogIn, BookOpen, HelpCircle } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <Button variant="ghost" size="icon" className="opacity-0">
        <Sun className="h-5 w-5" />
      </Button>
    );

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="rounded-full"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-lg shadow-sm"
          : "border-b border-transparent bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoKemenkum} alt="Logo Kementerian Hukum" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-foreground">MagangKUM</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          <a
            href="#top"
            className="relative px-3 py-2 text-sm font-semibold text-primary"
          >
            Beranda
            <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href="#positions">Lowongan</a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href="#features">Fitur</a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href="#about">Tentang</a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-foreground gap-1.5"
            asChild
          >
            <Link to="/panduan">Panduan</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-foreground gap-1.5"
            asChild
          >
            <Link to="/faq">FAQ</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href="#contact">Kontak</a>
          </Button>
        </div>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button size="sm" className="rounded-full px-5 gap-2" asChild>
            <Link to="/auth">
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-3">
                <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                  <a href="#positions">Lowongan</a>
                </Button>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                  <a href="#features">Fitur</a>
                </Button>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                  <a href="#about">Tentang</a>
                </Button>
                <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setOpen(false)}>
                  <Link to="/panduan">
                    <BookOpen className="h-4 w-4" />
                    Panduan
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setOpen(false)}>
                  <Link to="/faq">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </Button>
                <Button className="mt-4 gap-2" asChild onClick={() => setOpen(false)}>
                  <Link to="/auth">
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
