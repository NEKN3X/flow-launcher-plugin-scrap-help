import { open } from "https://deno.land/x/open/index.ts";

export async function openUrl(url: string) {
  await open(url, { wait: true });
}
