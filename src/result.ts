import { JSONRPCResponse } from "./flow-launcher-helper.ts";
import { expandHelpfeel } from "./parser.ts";
import { ScrapboxPage } from "./types.ts";

export function makeResult(
  project: string,
  data: ScrapboxPage,
  glossary: Map<string, string>
): JSONRPCResponse<`open`>[] {
  const helpfeels = data.helpfeels.flatMap((x) => expandHelpfeel(x, glossary));

  return [
    {
      title: data.title,
      subtitle: `${project}/`,
      method: "open",
      params: [`https://scrapbox.io/${project}/${data.title}`],
      iconPath: "assets/cosense.png",
    } as JSONRPCResponse<`open`>,
    ...helpfeels.map(
      (helpfeel) =>
        ({
          title: helpfeel,
          subtitle: `${project}/${data.title}`,
          method: "open",
          params: [`https://scrapbox.io/${project}/${data.title}`],
          iconPath: "assets/helpfeel.png",
        } as JSONRPCResponse<`open`>)
    ),
  ];
}
