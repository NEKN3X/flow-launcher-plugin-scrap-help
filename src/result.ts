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
  const openRegex = /^%\s+(https?:\/\/[^\s]+)$/;
  const fileRegex = /^%\s+([^\s]+)$/;
  const codeRegex = /\$\s+(.+)$/;
  return lines
    .map((x, i) => ({
      text: x.trim(),
      next: i + 1 < lines.length ? lines[i + 1].trim() : undefined,
    }))
    .filter((x) => /^\?\s/.test(x.text))
    .map((x) => {
      const openMatch = openRegex.exec(x.next || "");
      const fileMatch = fileRegex.exec(x.next || "");
      const codeMatch = codeRegex.exec(x.next || "");
      const helpfeel = x.text.replace(/^\?\s+/, "");

      if (codeMatch) {
        return {
          type: "copy",
          helpfeel,
          text: codeMatch[1],
        };
      }

      if (openMatch) {
        return {
          type: "open",
          helpfeel,
          url: openMatch[2],
        };
      }

      if (fileMatch) {
        return {
          type: "file",
          helpfeel,
          file: fileMatch[1],
        };
      }

      return {
        type: "scrapbox",
        helpfeel,
        url,
      };
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
        settings,
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
              params: [helpfeel.url, settings],
              iconPath: "assets/globe.png",
            } as FlowResponse;
          case "copy":
            return {
              title: x,
              subtitle: helpfeel.text,
              method: "copy",
              params: [helpfeel.text, settings],
              iconPath: "assets/clipboard-minus.png",
            } as FlowResponse;
          case "file":
            return {
              title: x,
              subtitle: `${project}/${data.title}/${helpfeel.file}`,
              method: "file",
              params: [project, data.title, helpfeel.file, settings],
              iconPath: "assets/file-code.png",
            } as FlowResponse;
          case "scrapbox":
            return {
              title: x,
              subtitle: `${project}/${data.title}`,
              method: "open",
              params: [helpfeel.url, settings],
              iconPath: "assets/circle-help.png",
            } as FlowResponse;
        }
      })
    ),
  ];
}
