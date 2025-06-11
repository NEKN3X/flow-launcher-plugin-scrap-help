import { ScrapboxPage, ScrapboxTitle } from "./types.ts";

const dbRoot = "./Cache/ScrapHelp/";

class CacheClient<T> {
  private dir: string;
  private file: string;

  constructor(dir: string, file: string) {
    this.dir = dir;
    this.file = file;
  }

  async read(): Promise<T> {
    try {
      await Deno.stat(dbRoot + this.dir + this.file + ".json");
    } catch (_) {
      await Deno.writeTextFile(
        dbRoot + this.dir + this.file + ".json",
        JSON.stringify({}, null, 2)
      );
      return {} as T;
    }
    const data = await Deno.readTextFile(
      dbRoot + this.dir + this.file + ".json"
    );
    return JSON.parse(data);
  }

  async write(data: T): Promise<void> {
    try {
      await Deno.stat(dbRoot + this.dir);
    } catch (_) {
      await Deno.mkdir(dbRoot + this.dir, { recursive: true });
    }
    try {
      await Deno.writeTextFile(
        dbRoot + this.dir + this.file + ".json",
        JSON.stringify(data, null, 2)
      );
    } catch (_) {
      throw new Error(
        `Failed to write cache file: ${dbRoot}${this.dir}/${this.file}.json`
      );
    }
  }

  async delete(): Promise<void> {
    try {
      await Deno.remove(dbRoot + this.dir + this.file + ".json");
    } catch (_) {
      throw new Error(
        `Failed to delete cache file: ${dbRoot}${this.dir}/${this.file}.json`
      );
    }
  }
}

export function getTitlesCacheClient(
  project: string
): CacheClient<ScrapboxTitle[]> {
  return new CacheClient<ScrapboxTitle[]>(`projects/${project}/`, "titles");
}
export function getPageCacheClient(
  project: string,
  page: string
): CacheClient<ScrapboxPage> {
  return new CacheClient<ScrapboxPage>(`projects/${project}/pages/`, page);
}

export function getTempCacheClient(): CacheClient<{ lastUpdate: number }> {
  return new CacheClient<{ lastUpdate: number }>("", "temp");
}
