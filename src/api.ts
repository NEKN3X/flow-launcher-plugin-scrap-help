import { ScrapboxPage, ScrapboxTitle } from "./types.ts";

const baseUrl = "https://scrapbox.io/api";

const fetchScrapbox = (url: string, sid?: string) =>
  fetch(url, {
    headers: {
      Cookie: sid ? `connect.sid=${sid}` : "",
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    }
    return res;
  });

export const api = {
  getTitles: (project: string, sid?: string) =>
    fetchScrapbox(`${baseUrl}/pages/${project}/search/titles`, sid).then(
      (res) => res.json() as Promise<ScrapboxTitle[]>
    ),
  getPage: (project: string, page: string, sid?: string) =>
    fetchScrapbox(
      `${baseUrl}/pages/${project}/${encodeURIComponent(page)}`,
      sid
    ).then((res) => res.json() as Promise<ScrapboxPage>),
  getFile: (project: string, page: string, file: string, sid?: string) =>
    fetchScrapbox(
      `${baseUrl}/code/${project}/${page}/${encodeURIComponent(file)}`,
      sid
    ).then((res) => res.text()),
};
