// Components
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { HomeProvider } from "@/components/context/HomeContext";
import { CartProvider } from "@/components/context/CartContext";
import { WishlistProvider } from "@/components/context/WishlistContext";

export default function TemplateLayout({ children }) {
    return (
        <>
            <HomeProvider>
                <CartProvider>
                    <WishlistProvider>
                        <div className="bg-[#f5f5f5] pb-16 lg:pb-0">
                            <Header />
                            {children}
                            <Footer />
                        </div>
                    </WishlistProvider>
                </CartProvider>
            </HomeProvider>
        </>
    );
}
