// deno-lint-ignore-file no-empty-interface
import { open } from "https://deno.land/x/open@v0.0.5/index.ts";
import { Flow } from "./flow-launcher-helper.ts";

// The events are the custom events that you define in the flow.on() method.
const events = ["search"] as const;
type Events = typeof events[number];

// This is optional for when you want to use settings. If you do you should create a SettingsTemplate.yaml
interface Settings {}

const flow = new Flow<Events, Settings>("assets/deno.png");

flow.on("query", params => {
  const qp = new URLSearchParams({
    query: params[0].toString(),
  });

  const url = `https://deno.land/x?${qp}`;

  flow.showResult({
    title: `Search Deno package: ${params}`,
    subtitle: url,
    method: "search",
    params: [url],
    iconPath: "assets/deno.png",
  });
});

flow.on("search", params => {
  const url = params[0].toString();

  open(url);
});

flow.run();
