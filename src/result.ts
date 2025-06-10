import { JSONRPCResponse } from "./flow-launcher-helper.ts";
import { expandHelpfeel } from "./parser.ts";
import { ScrapboxPage } from "./types.ts";

type Help = {
  helpfeel: string;
  url: string;
};

function extractHelp(url: string, lines: string[]): Help[] {
  const helpRegex = /^% (echo|open)\s+(http(s)?:\/\/[^\s]+)\s*$/;
  return lines
    .map((x, i) => ({
      text: x,
      next: i + 1 < lines.length ? lines[i + 1] : undefined,
    }))
    .filter((x) => /^\?\s/.test(x.text))
    .map((x) => {
      return {
        helpfeel: x.text.replace(/^\?\s+/, ""),
        url:
          x.next && helpRegex.test(x.next) ? x.next.match(helpRegex)![2] : url,
      };
    });
}

export function makeResult(
  project: string,
  data: ScrapboxPage,
  glossary: Map<string, string>
): JSONRPCResponse<`open`>[] {
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
    } as JSONRPCResponse<`open`>,
    ...helpfeels.flatMap((helpfeel) =>
      expandHelpfeel(helpfeel.helpfeel, glossary).map((x) => {
        const isScrapboxHelp = /https?:\/\/scrapbox\.io\//.test(helpfeel.url);
        return {
          title: x,
          subtitle: isScrapboxHelp
            ? `${project}/${data.title}`
            : helpfeel.url.replace(/https?:\/\//, ""),
          method: "open",
          params: [helpfeel.url],
          iconPath: isScrapboxHelp
            ? "assets/circle-help.png"
            : "assets/link.png",
        } as JSONRPCResponse<`open`>;
      })
    ),
  ];
}
