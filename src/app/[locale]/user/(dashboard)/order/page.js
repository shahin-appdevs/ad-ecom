// Components
import OrderSection from "@/components/dashboard/pages/order/order";


export default function Order() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <OrderSection />
                </div>
            </div>
        </>
    );
}