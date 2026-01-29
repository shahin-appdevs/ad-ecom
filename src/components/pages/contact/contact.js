export default function Contact() {
    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:p-6 md:p-10 rounded-md">
                    <div className="flex items-center justify-center mb-4">
                        <h4>Contact</h4>
                    </div>
                    <div className="grid grid-cols-12">
                        <div className="space-y-4 col-span-12 md:col-span-7 md:col-start-3">
                            <h6 className="text-sm md:text-base font-bold">OUR OFFICE</h6>
                            <div className="space-y-2">
                                <h6 className="font-bold mb-2">Dhaka Office:</h6>
                                <p className="text-sm md:text-base text-gray-800">Road#3/F, Sector#09,</p>
                                <p className="text-sm md:text-base text-gray-800">Uttara Model Town, Dhaka - 1230</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm md:text-base text-gray-800"><span className="font-bold text-color__heading">WhatsApp No:</span> +88 01712 43 57 32</p>
                                <p className="text-sm md:text-base text-gray-800"><span className="font-bold text-color__heading">Customer service:</span> +88 096 38 71 67 13</p>
                                <p className="text-sm md:text-base text-gray-800"><span className="font-bold text-color__heading">Bkash Agent:</span> +88 01784 72 68 56</p>
                            </div>
                            <div className="space-y-2">
                                <h6 className="font-bold mb-2">Zonal Office:</h6>
                                <p className="text-sm md:text-base text-gray-800">Showapno Chura Market</p>
                                <p className="text-sm md:text-base text-gray-800">Nalta Sharif More Kaligonj Shatkhira</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm md:text-base text-gray-800"><span className="font-bold text-color__heading">WhatsApp No:</span> +88 01712 43 57 32</p>
                                <p className="text-sm md:text-base text-gray-800"><span className="font-bold text-color__heading">Bkash Mobile:</span> +88 01784 72 68 56</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}