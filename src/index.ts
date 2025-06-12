import * as clippy from "https://deno.land/x/clippy@v1.0.0/mod.ts";
import { Flow, JSONRPCResponse } from "npm:flow-launcher-helper";
import { api } from "./api.ts";
import { getPageCacheClient, getTitlesCacheClient } from "./cache.ts";
import { openUrl } from "./open.ts";
import { makeResult } from "./result.ts";
import { search } from "./search.ts";
import { Settings } from "./types.ts";

// The events are the custom events that you define in the flow.on() method.
const events = ["update", "open", "copy", "file"] as const;
type Events = (typeof events)[number];

export type FlowResponse = JSONRPCResponse<Events>;
const flow = new Flow<Events, Settings>("assets/image.png");

flow.on("query", async (params) => {
  const projects = flow.settings.projects.trim().split(",");

  const glossaryProject = flow.settings.glossary;
  const pages = (await getTitlesCacheClient(glossaryProject).read()).find(
    (x) => x.title === "Glossary"
  );
  const glossaryDesc = pages
    ? (await getPageCacheClient(glossaryProject, pages.id).read()).descriptions
    : [];
  const glossary: Map<string, string> = new Map(
    glossaryDesc.flatMap((desc) => {
      const match = desc.match(/^\s*([^\s\:]+):\s*\`(.*)\`$/);
      return match ? [[match[1], match[2]]] : [];
    })
  );

  await Promise.all(
    projects.flatMap(async (project) => {
      const titlesCacheClient = getTitlesCacheClient(project);
      const cache = await titlesCacheClient.read();
      if (!cache) return [];
      return Promise.all(
        cache.flatMap(async (title) => {
          const client = getPageCacheClient(project, title.id);
          const data = await client.read();
          if (!data) return [];
          return makeResult(project, data, glossary, flow.settings);
        })
      );
    })
  ).then((results) => {
    flow.showResult(
      ...search(
        results
          .flat()
          .flat()
          .concat([] as FlowResponse[]),
        params[0].toString()
      ).concat([
        {
          title: "NEW",
          subtitle: "Click to create a new page",
          iconPath: "assets/cosense.png",
          method: "open",
          params: [
            `https://scrapbox.io/${
              params[0].toString().split(" ").length > 1
                ? params[0].toString().split(" ")[0]
                : flow.settings.projects.trim().split(",")[0]
            }/${
              params[0].toString().split(" ").length > 1
                ? encodeURIComponent(params[0].toString().split(" ")[1])
                : encodeURIComponent(params[0].toString())
            }`,
          ],
          score: -100,
        },
        {
          title: "UPDATE",
          subtitle: "Click to update cache",
          iconPath: "assets/cosense.png",
          method: "update",
          params: [flow.settings],
          score: -100,
        },
      ])
    );
  });
});

const updateCache = async (projects: string[], settings: Settings) => {
  await Promise.all(
    projects.map(async (project) => {
      const titlesCacheClient = getTitlesCacheClient(project);
      const titlesCache = (await titlesCacheClient.read()) || [];
      const titles = await api.getTitles(project, settings.sid);
      const titlesCacheMap = new Map(
        titlesCache.map((title) => [title.id, title.updated])
      );
      titles
        .filter((title) => {
          const updated = titlesCacheMap.get(title.id);
          return !updated || updated < title.updated;
        })
        .forEach(async (title) => {
          const page = await api.getPage(project, title.title, settings.sid);
          const client = getPageCacheClient(project, title.id);
          client.write(page);
        });
      titlesCacheMap.keys().forEach((id) => {
        if (!titles.some((title) => title.id === id)) {
          const client = getPageCacheClient(project, id);
          client.delete();
        }
      });

      await titlesCacheClient.write(titles);
    })
  );
};

flow.on("update", async (params) => {
  const settings = params[0] as Settings;
  const projects = settings.projects.trim().split(",");

  // const timeoutCache = getTempCacheClient();
  // const lastUpdate = (await timeoutCache.read())?.lastUpdate || 0;
  // const now = Date.now();
  // if (now > lastUpdate + Number(settings.timeout)) {
  // await timeoutCache.write({ lastUpdate });

  await updateCache(projects, settings);
  // }
});

flow.on("open", async (params) => {
  const settings = params[1] as Settings;
  const projects = settings.projects.trim().split(",");
  Promise.all([
    await openUrl(params[0].toString()),
    await updateCache(projects, settings),
  ]);
});

flow.on("copy", async (params) => {
  const settings = params[1] as Settings;
  const projects = settings.projects.trim().split(",");
  Promise.all([
    await clippy.writeText(params[0].toString()),
    await updateCache(projects, settings),
  ]);
});

flow.on("file", async (params) => {
  const file = await api.getFile(
    params[0].toString(),
    params[1].toString(),
    params[2].toString(),
    params[3].toString()
  );
  const settings = params[4] as Settings;
  const projects = settings.projects.trim().split(",");
  Promise.all([
    await clippy.writeText(file),
    await updateCache(projects, settings),
  ]);
});

flow.run();
