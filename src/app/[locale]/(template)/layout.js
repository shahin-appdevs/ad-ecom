// Components
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { HomeProvider } from "@/components/context/HomeContext";
import { CartProvider } from "@/components/context/CartContext";
import { WishlistProvider } from "@/components/context/WishlistContext";
import { Suspense } from "react";

export default function TemplateLayout({ children }) {
    return (
        <>
            <HomeProvider>
                <CartProvider>
                    <WishlistProvider>
                        <div className="bg-[#f5f5f5] pb-16 lg:pb-0">
                            <Suspense fallback={<div>Loading...</div>}>
                                <Header />
                            </Suspense>
                            {children}
                            <Suspense fallback={<div>Loading...</div>}>
                                <Footer />
                            </Suspense>
                        </div>
                    </WishlistProvider>
                </CartProvider>
            </HomeProvider>
        </>
    );
}
