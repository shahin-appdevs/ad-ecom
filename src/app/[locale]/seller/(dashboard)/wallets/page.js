// Components
import SellerWalletSection from "@/components/dashboard/pages/seller/sellerWallet/sellerWallet";


export default function SellerWallet() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <SellerWalletSection />
                </div>
            </div>
        </>
    );
}