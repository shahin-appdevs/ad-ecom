// Components
import UserProfileSection from "@/components/dashboard/pages/userProfile/userProfile";


export default function UserProfile() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <UserProfileSection />
                </div>
            </div>
        </>
    );
}