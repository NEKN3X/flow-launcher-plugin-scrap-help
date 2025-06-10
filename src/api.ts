import { ScrapboxPage, ScrapboxTitle } from "./types.ts";

const baseUrl = "https://scrapbox.io/api";

const fetchScrapbox = <T>(url: string, sid?: string) =>
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
    return res.json() as Promise<T>;
  });

export const api = {
  getTitles: (project: string, sid?: string) =>
    fetchScrapbox<ScrapboxTitle[]>(
      `${baseUrl}/pages/${project}/search/titles`,
      sid
    ),
  getPage: (project: string, page: string, sid?: string) =>
    fetchScrapbox<ScrapboxPage>(
      `${baseUrl}/pages/${project}/${encodeURIComponent(page)}`,
      sid
    ),
};
