export const dynamic = "force-dynamic";
// Components
import BannerSection from "@/components/pages/home/banner";
import WelcomeSection from "@/components/pages/home/welcome";
import FlashSaleSection from "@/components/pages/home/flashSale";
import NewArrivalSection from "@/components/pages/home/newArrival";
import BrandSection from "@/components/pages/home/brand";
import StallSection from "@/components/pages/home/stall";
import CategoryProductsSection from "@/components/pages/home/categoryProducts";
import SmartGadgetSection from "@/components/pages/home/smartGadget";
import BagJewellerySection from "@/components/pages/home/bagJuwellery";
import ElectronicsDeviceSection from "@/components/pages/home/electronicsDevice";
import HomeKitchenSection from "@/components/pages/home/homeKitchen";
import ComputerSection from "@/components/pages/home/computer";
import RealEstateSection from "@/components/pages/home/realEstate";
import { Suspense } from "react";

export default function HomePage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <BannerSection />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <WelcomeSection />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <FlashSaleSection />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <NewArrivalSection />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <BrandSection />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <StallSection />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
                <CategoryProductsSection />
            </Suspense>
            {/* <SmartGadgetSection />
            <BagJewellerySection />
            <ElectronicsDeviceSection />
            <HomeKitchenSection />
            <ComputerSection />
            <RealEstateSection /> */}
        </>
    );
}
