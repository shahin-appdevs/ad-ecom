export default function Privacy({ privacyPolicy }) {
    const title = privacyPolicy?.title?.language?.en?.title;
    const details = privacyPolicy?.details?.language?.en?.details;

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:p-6 md:p-10 rounded-md space-y-6">
                    <div className="flex items-center justify-center mb-4 bg-blue-50 py-4">
                        <h4>{title}</h4>
                    </div>
                    {details && (
                        <div
                            dangerouslySetInnerHTML={{ __html: details }}
                        ></div>
                    )}
                </div>
            </div>
        </section>
    );
}
