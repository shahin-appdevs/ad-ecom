// Components
import OrderDetailsSection from "@/components/dashboard/pages/order/orderDetais";


export default function OrderDetails() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <OrderDetailsSection />
                </div>
            </div>
        </>
    );
}