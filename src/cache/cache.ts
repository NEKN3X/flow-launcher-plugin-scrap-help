import { ScrapboxPage, ScrapboxTitle } from "../types.ts";

const dbRoot = "./src/db/projects/";

class CacheClient<T> {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  read(): T | null {
    try {
      const data = Deno.readTextFileSync(dbRoot + this.path + ".json");
      return JSON.parse(data);
    } catch (_) {
      return null;
    }
  }

  write(data: T): void {
    try {
      Deno.writeTextFileSync(
        dbRoot + this.path + ".json",
        JSON.stringify(data, null, 2)
      );
    } catch (_) {
      throw new Error(`Failed to write cache at ${dbRoot + this.path}`);
    }
  }
}

export function getTitlesCacheClient(
  project: string
): CacheClient<ScrapboxTitle[]> {
  return new CacheClient<ScrapboxTitle[]>(`${project}/titles`);
}
export function getPageCacheClient(
  project: string,
  page: string
): CacheClient<ScrapboxPage> {
  return new CacheClient<ScrapboxPage>(`${project}/pages/${page}`);
}
