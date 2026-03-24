// next.config.mjs
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin();

// if (process.env.NODE_ENV === "development") {
//     initOpenNextCloudflareForDev(); // ✅ safe here
// }

const nextConfig = {
    images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
