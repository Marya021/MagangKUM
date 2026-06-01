import { LandingNavbar } from "@/features/landing/LandingNavbar";
import { LandingHero } from "@/features/landing/LandingHero";
import { LandingStats } from "@/features/landing/LandingStats";
import { LandingTrust } from "@/features/landing/LandingTrust";
import { LandingFeatures } from "@/features/landing/LandingFeatures";
import { LandingPositions } from "@/features/landing/LandingPositions";
import { LandingAbout } from "@/features/landing/LandingAbout";
import { LandingCTA } from "@/features/landing/LandingCTA";
import { LandingTestimonials } from "@/features/landing/LandingTestimonials";
import { LandingHowItWorks } from "@/features/landing/LandingHowItWorks";
import { LandingFooter } from "@/features/landing/LandingFooter";
import { useLandingData } from "@/features/landing/hooks";
import {
  HeroSkeleton,
  StatsSkeleton,
  FeaturesSkeleton,
  PositionsSkeleton,
  AboutSkeleton,
  CTASkeleton,
} from "@/features/landing/LandingSkeletons";

export default function Landing() {
  const { positions, loading, stats, totalQuota } = useLandingData();

  return (
    <div className="relative min-h-screen landing-bg">
      <LandingNavbar />
      {loading ? (
        <>
          <HeroSkeleton />
          <StatsSkeleton />
          <FeaturesSkeleton />
          <PositionsSkeleton />
          <AboutSkeleton />
          <CTASkeleton />
        </>
      ) : (
        <>
          <LandingHero positionsCount={positions.length} totalQuota={totalQuota} />
          <LandingStats stats={stats} />
          <LandingTrust />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingPositions positions={positions} loading={false} />
          <LandingAbout />
          <LandingTestimonials />
          <LandingCTA />
        </>
      )}
      <LandingFooter />
    </div>
  );
}
