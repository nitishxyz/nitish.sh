export function getOpenGraphImagePath({
  url,
  site,
}: {
  url: URL;
  site: URL | undefined;
}) {
  if (!site) {
    throw new Error("`site` must be set in your Astro configuration.");
  }

  let target = url.pathname;

  if (target.endsWith("/")) {
    target = `${target}index.png`;
  } else {
    target = `${target}.png`;
  }

  if (target === "/404/index.png") {
    return `${site.toString()}404.png`;
  }

  if (target === "/500/index.png") {
    return `${site.toString()}500.png`;
  }

  return `${site.toString()}${target.slice(1)}`;
}
