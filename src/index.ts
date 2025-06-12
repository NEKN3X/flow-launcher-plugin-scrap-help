import * as clippy from "https://deno.land/x/clippy@v1.0.0/mod.ts";
import { Flow, JSONRPCResponse } from "npm:flow-launcher-helper";
import { api } from "./api.ts";
import {
  getPageCacheClient,
  getTempCacheClient,
  getTitlesCacheClient,
} from "./cache.ts";
import { openUrl } from "./open.ts";
import { makeResult } from "./result.ts";
import { search } from "./search.ts";
import { Settings } from "./types.ts";

// The events are the custom events that you define in the flow.on() method.
const events = ["open", "copy", "file"] as const;
type Events = (typeof events)[number];

export type FlowResponse = JSONRPCResponse<Events>;
const flow = new Flow<Events, Settings>("assets/image.png");

flow.on("query", async (params) => {
  const projects = flow.settings.projects.trim().split(",");

  const timeoutCache = getTempCacheClient();
  const lastUpdate = (await timeoutCache.read())?.lastUpdate || 0;
  const now = Date.now();
  if (now > lastUpdate + Number(flow.settings.timeout)) {
    await timeoutCache.write({ lastUpdate });

    projects.forEach(async (project) => {
      const titlesCacheClient = getTitlesCacheClient(project);
      const titlesCache = (await titlesCacheClient.read()) || [];
      const titles = await api.getTitles(project, flow.settings.sid);
      const titlesCacheMap = new Map(
        titlesCache.map((title) => [title.id, title.updated])
      );
      titles
        .filter((title) => {
          const updated = titlesCacheMap.get(title.id);
          return !updated || updated < title.updated;
        })
        .forEach(async (title) => {
          const page = await api.getPage(
            project,
            title.title,
            flow.settings.sid
          );
          const client = getPageCacheClient(project, title.id);
          client.write(page);
        });
      titlesCacheMap.keys().forEach((id) => {
        if (!titles.some((title) => title.id === id)) {
          const client = getPageCacheClient(project, id);
          client.delete();
        }
      });

      titlesCacheClient.write(titles);
    });
  }

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
    flow.showResult(...search(results.flat().flat(), params[0].toString()));
  });
});

flow.on("open", async (params) => {
  await openUrl(params[0].toString());
});

flow.on("copy", async (params) => {
  await clippy.writeText(params[0].toString());
});

flow.on("file", async (params) => {
  const file = await api.getFile(
    params[0].toString(),
    params[1].toString(),
    params[2].toString(),
    params[3].toString()
  );
  await clippy.writeText(file);
});

flow.run();
