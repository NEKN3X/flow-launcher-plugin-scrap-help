import { Fzf, byLengthAsc } from "fzf";
import { FlowResponse } from "./index.ts";

export function search(data: FlowResponse[], query: string): FlowResponse[] {
  const segmenter = new Intl.Segmenter(["ja-JP", `en-US`], {
    granularity: "word",
  });
  const segmentText = (text: string) =>
    [...segmenter.segment(text)]
      .filter((segment) => segment.isWordLike)
      .map((x) => x.segment)
      .join(" ");
  const splitAlphaNum = (str: string) => {
    const parts = str.match(/\D+|\d+/g);
    return parts ? parts.join(" ") : "";
  };
  const segmented = data.map((x) => ({
    ...x,
    segmented: splitAlphaNum(segmentText(x.title)).toLowerCase(),
  }));
  const fzf = new Fzf(segmented, {
    selector: (x) => x.segmented,
    tiebreakers: [byLengthAsc],
  });
  const searchText = splitAlphaNum(segmentText(query)).toLowerCase();
  const result = fzf.find(searchText);
  return result
    .map((x) => x.item)
    .reduce((acc, item) => {
      if (acc.some((x) => x.params![0] === item.params![0])) {
        return acc;
      }
      return [...acc, item];
    }, [] as FlowResponse[]);
}
