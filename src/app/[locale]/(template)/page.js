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

export default function HomePage() {
    return (
        <>
            <BannerSection />
            <WelcomeSection />
            <FlashSaleSection />
            <NewArrivalSection />
            <BrandSection />
            <StallSection />
            <CategoryProductsSection />
            {/* <SmartGadgetSection />
            <BagJewellerySection />
            <ElectronicsDeviceSection />
            <HomeKitchenSection />
            <ComputerSection />
            <RealEstateSection /> */}
        </>
    );
}
