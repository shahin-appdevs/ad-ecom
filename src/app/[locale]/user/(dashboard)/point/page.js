// Components
import PointSection from "@/components/dashboard/pages/point/point";


export default function Point() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <PointSection />
                </div>
            </div>
        </>
    );
}