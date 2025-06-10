import { open } from "https://deno.land/x/open/index.ts";

export async function openUrl(url: string) {
  // Windows限定かは分からないけど、openが遅いので直接startを呼ぶ
  if (Deno.build.os === "windows") {
    const command = new Deno.Command("cmd", {
      args: ["/c", "start", url],
    });
    await command.output();
  } else {
    await open(url);
  }
}
