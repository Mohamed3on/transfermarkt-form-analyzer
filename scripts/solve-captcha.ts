/**
 * Solves the Transfermarkt AWS WAF CAPTCHA via 2captcha and outputs
 * the aws-waf-token cookie value to stdout.
 *
 * Usage: TM_2CAPTCHA_KEY=xxx bun run scripts/solve-captcha.ts
 */

const API_KEY = process.env.TM_2CAPTCHA_KEY;
if (!API_KEY) {
  console.error("Missing TM_2CAPTCHA_KEY env var");
  process.exit(1);
}

const TM_URL = "https://www.transfermarkt.com/";
const POLL_INTERVAL = 5_000;
const MAX_POLLS = 60;

async function fetchCaptchaPage(): Promise<{
  sitekey: string;
  iv: string;
  context: string;
  challengeScript: string;
  captchaScript: string;
}> {
  const res = await fetch(TM_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html",
    },
  });
  const html = await res.text();

  const propsMatch = html.match(/window\.gokuProps\s*=\s*(\{[\s\S]*?\});/);
  if (!propsMatch) throw new Error("No gokuProps found — CAPTCHA page may have changed");

  const props = JSON.parse(propsMatch[1]);

  const challengeMatch = html.match(/src="(https:\/\/[^"]+\/challenge\.js)"/);
  const captchaMatch = html.match(/src="(https:\/\/[^"]+\/captcha\.js)"/);
  if (!challengeMatch || !captchaMatch)
    throw new Error("Could not find challenge/captcha script URLs");

  return {
    sitekey: props.key,
    iv: props.iv,
    context: props.context,
    challengeScript: challengeMatch[1],
    captchaScript: captchaMatch[1],
  };
}

async function submitTo2Captcha(params: {
  sitekey: string;
  iv: string;
  context: string;
  challengeScript: string;
  captchaScript: string;
}): Promise<string> {
  const body = new URLSearchParams({
    key: API_KEY!,
    method: "amazon_waf",
    sitekey: params.sitekey,
    iv: params.iv,
    context: params.context,
    pageurl: TM_URL,
    challengescript: params.challengeScript,
    captchascript: params.captchaScript,
    json: "1",
  });

  const res = await fetch("https://2captcha.com/in.php", {
    method: "POST",
    body,
  });
  const data = await res.json();

  if (data.status !== 1) throw new Error(`2captcha submit failed: ${JSON.stringify(data)}`);
  return data.request as string;
}

async function pollResult(taskId: string): Promise<string> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    const res = await fetch(
      `https://2captcha.com/res.php?key=${API_KEY}&action=get&id=${taskId}&json=1`,
    );
    const data = await res.json();

    if (data.status === 1) return data.request as string;
    if (data.request !== "CAPCHA_NOT_READY") {
      throw new Error(`2captcha solve failed: ${JSON.stringify(data)}`);
    }
    console.error(`[captcha] Waiting... (${i + 1}/${MAX_POLLS})`);
  }
  throw new Error("2captcha timed out");
}

async function main() {
  console.error("[captcha] Fetching CAPTCHA page...");
  const params = await fetchCaptchaPage();

  console.error("[captcha] Submitting to 2captcha...");
  const taskId = await submitTo2Captcha(params);
  console.error(`[captcha] Task ID: ${taskId}`);

  console.error("[captcha] Polling for solution...");
  const token = await pollResult(taskId);

  // Output just the cookie value to stdout
  console.log(`aws-waf-token=${token}`);
  console.error("[captcha] Done!");
}

main().catch((err) => {
  console.error("[captcha] Fatal:", err);
  process.exit(1);
});
