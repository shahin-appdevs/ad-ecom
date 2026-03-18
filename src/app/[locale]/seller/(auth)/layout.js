"use client";
// Components
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { CartProvider } from "@/components/context/CartContext";
import { Suspense } from "react";

export default function AuthLayout({ children }) {
    return (
        <>
            <CartProvider>
                <div className="bg-[#f5f5f5] pb-16 lg:pb-0">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Header />
                    </Suspense>
                    {children}
                    <Suspense fallback={<div>Loading...</div>}>
                        <Footer />
                    </Suspense>
                </div>
            </CartProvider>
        </>
    );
}
