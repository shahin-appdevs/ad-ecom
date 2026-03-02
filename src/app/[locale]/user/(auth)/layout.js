// Components
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { CartProvider } from "@/components/context/CartContext";

export default function AuthLayout({ children }) {
    return (
        <>
            <CartProvider>
                <div className="bg-[#f5f5f5] pb-16 lg:pb-0">
                    <Header />
                    {children}
                    <Footer />
                </div>
            </CartProvider>
        </>
    );
}