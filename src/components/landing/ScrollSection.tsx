import { useScrollAnimation, type ScrollDirection } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: ScrollDirection;
}

const hiddenClasses: Record<ScrollDirection, string> = {
  up: "opacity-0 translate-y-10",
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
};

export function ScrollSection({ children, className, delay = 0, direction = "up" }: ScrollSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.1, direction);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : hiddenClasses[direction],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
