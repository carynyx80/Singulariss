import { ComingSoon } from "@/components/landing/ComingSoon";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Ecosystem } from "@/components/landing/Ecosystem";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductOverview } from "@/components/landing/ProductOverview";
import { SecurityRisk } from "@/components/landing/SecurityRisk";
import { TitanSection } from "@/components/landing/TitanSection";

export default function LandingPage() {
  return (
    <div className="w-full">
      <Hero />
      <div className="pt-8">
        <ComingSoon />
      </div>
      <ProductOverview />
      <HowItWorks />
      <Ecosystem />
      <DashboardPreview />
      <TitanSection />
      <SecurityRisk />
      <FinalCta />
    </div>
  );
}
