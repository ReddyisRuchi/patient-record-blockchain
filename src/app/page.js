import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";


export default function Home() {
  return (
    <>
      <Navbar />

      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-12">
            Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Secure Storage"
              description="All patient records are stored securely with controlled access."
            />
            <FeatureCard
              title="Role-Based Access"
              description="Only authorized personnel can create and verify records."
            />
            <FeatureCard
              title="Data Integrity"
              description="Records are protected to prevent unauthorized modifications."
            />
          </div>
        </div>
      </section>

  
    </>
  );
}