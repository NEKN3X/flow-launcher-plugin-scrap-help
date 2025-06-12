import { FlowResponse } from "./index.ts";
import { expandHelpfeel } from "./parser.ts";
import { ScrapboxPage, Settings } from "./types.ts";

type OpenUrlHelp = {
  type: "open" | "scrapbox";
  helpfeel: string;
  url: string;
};
type CopyTextHelp = {
  type: "copy";
  helpfeel: string;
  text: string;
};
type CopyFileHelp = {
  type: "file";
  helpfeel: string;
  file: string;
};
type Help = OpenUrlHelp | CopyTextHelp | CopyFileHelp;

function extractHelp(url: string, lines: string[]): Help[] {
  const helpRegex = /^% (open|copy|file)\s+(.+)$/;
  return lines
    .map((x, i) => ({
      text: x,
      next: i + 1 < lines.length ? lines[i + 1] : undefined,
    }))
    .filter((x) => /^\?\s/.test(x.text))
    .map((x) => {
      const match = helpRegex.exec(x.next || "");
      const helpfeel = x.text.replace(/^\?\s+/, "");
      if (!match)
        return {
          type: "scrapbox",
          helpfeel,
          url,
        };

      const [, type] = match;
      switch (type) {
        case "copy":
          return {
            type: "copy",
            helpfeel,
            text: match[2],
          };
        case "file":
          return {
            type: "file",
            helpfeel,
            file: match[2],
          };
        default:
          return {
            type: "open",
            helpfeel,
            url: match[2],
          };
      }
    });
}

export function makeResult(
  project: string,
  data: ScrapboxPage,
  glossary: Map<string, string>,
  settings: Settings
): FlowResponse[] {
  const helpfeels = extractHelp(
    `https://scrapbox.io/${project}/${encodeURIComponent(data.title)}`,
    data.lines.map((x) => x.text)
  );

  return [
    {
      title: data.title,
      subtitle: `${project}/`,
      method: "open",
      params: [
        `https://scrapbox.io/${project}/${encodeURIComponent(data.title)}`,
      ],
      iconPath: "assets/sticky-note.png",
    } as FlowResponse,
    ...helpfeels.flatMap((helpfeel) =>
      expandHelpfeel(helpfeel.helpfeel, glossary).map((x) => {
        switch (helpfeel.type) {
          case "open":
            return {
              title: x,
              subtitle: `${project}/${data.title}`,
              method: "open",
              params: [helpfeel.url],
              iconPath: "assets/globe.png",
            } as FlowResponse;
          case "copy":
            return {
              title: x,
              subtitle: helpfeel.text,
              method: "copy",
              params: [helpfeel.text],
              iconPath: "assets/clipboard-minus.png",
            } as FlowResponse;
          case "file":
            return {
              title: x,
              subtitle: `${project}/${data.title}/${helpfeel.file}`,
              method: "file",
              params: [project, data.title, helpfeel.file, settings.sid],
              iconPath: "assets/file-code.png",
            } as FlowResponse;
          case "scrapbox":
            return {
              title: x,
              subtitle: `${project}/${data.title}`,
              method: "open",
              params: [helpfeel.url],
              iconPath: "assets/circle-help.png",
            } as FlowResponse;
        }
      })
    ),
  ];
}
