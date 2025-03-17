import { Suspense } from "react";
import dynamic from "next/dynamic";
import SectionSkeleton from "@components/sections/section-skeleton";
import AuthCheckClient from "@components/auth/auth-check";
import ProductProvider from "@components/sections/product-provider";

const HeroSection = dynamic(() => import("@components/hero-section"), {
  loading: () => <SectionSkeleton height="500px" />
});

const CategoryPanel = dynamic(() => import("@components/panels/category-panel/index"), {
  loading: () => <SectionSkeleton height="300px" />
});

const ReadyToStart = dynamic(() => import("@components/ready-to-start/ready-to-start"), {
  loading: () => <SectionSkeleton height="400px" />,
});

export default async function IndexPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <ProductProvider>
        <Suspense fallback={<SectionSkeleton height="500px" />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="300px" />}>
          <CategoryPanel />
        </Suspense>
      </ProductProvider>

      <AuthCheckClient fallback={
        <Suspense fallback={<SectionSkeleton height="400px" />}>
          <ReadyToStart />
        </Suspense>
      } />
    </div>
  );
}