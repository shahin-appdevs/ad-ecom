// dev-cloudflare.js
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

import { execSync } from "child_process";
execSync("next dev", { stdio: "inherit" });
