// Components
import PointConversionTransactionSection from "@/components/dashboard/pages/transactions/pointConversion";


export default function PointConversionTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <PointConversionTransactionSection />
                </div>
            </div>
        </>
    );
}