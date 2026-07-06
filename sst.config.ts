/// <reference path="./.sst/platform/config.d.ts" />

const HOST = "nitish.sh";
const DEPLOYED_STAGES = ["prod", "dev"];

export default $config({
  app(input) {
    return {
      name: "nitish-sh",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {
    const subdomain = $app.stage === "prod" ? "" : `${$app.stage}.`;
    const site = new sst.cloudflare.Astro("Site", {
      path: ".",
      buildCommand: "bun run build",
      domain: DEPLOYED_STAGES.includes($app.stage) ? `${subdomain}${HOST}` : undefined,
      dev: {
        command: "bun run dev",
        directory: ".",
      },
    });

    return {
      site: site.url,
    };
  },
});
