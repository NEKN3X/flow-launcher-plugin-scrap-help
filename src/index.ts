import { Flow } from "./flow-launcher-helper.ts";
import { openUrl } from "./open.ts";
import { Settings } from "./types.ts";

// The events are the custom events that you define in the flow.on() method.
const events = ["search"] as const;
type Events = (typeof events)[number];

const flow = new Flow<Events, Settings>("assets/image.png");

flow.on("query", (params) => {
  const qp = new URLSearchParams({
    query: params[0].toString(),
  });

  const url = `https://deno.land/x?${qp}`;

  flow.showResult({
    title: `Search Deno package: ${params}`,
    subtitle: url,
    method: "search",
    params: [url],
    iconPath: "assets/image.png",
  });
});

flow.on("search", async (params) => {
  await openUrl("https://scrapbox.io/nekn3x/あいうえお");
});

flow.run();
