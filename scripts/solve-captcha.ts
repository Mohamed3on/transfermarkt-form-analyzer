/**
 * Solves the Transfermarkt AWS WAF CAPTCHA via Playwright + 2captcha.
 *
 * Flow: Playwright loads the CAPTCHA page → 2captcha solves it → Playwright
 * injects the voucher via the AWS WAF SDK → extracts the minted cookie.
 *
 * Outputs the aws-waf-token cookie to stdout.
 * Skips solving if TM_COOKIE env var is still valid.
 */

import { chromium } from "playwright";

const API_KEY = process.env.TM_2CAPTCHA_KEY;
if (!API_KEY) {
  console.error("Missing TM_2CAPTCHA_KEY env var");
  process.exit(1);
}

const EXISTING_COOKIE = process.env.TM_COOKIE || "";
const TM_URL = "https://www.transfermarkt.com/";
const POLL_INTERVAL = 5_000;
const MAX_POLLS = 60;

async function isExistingCookieValid(): Promise<boolean> {
  if (!EXISTING_COOKIE) return false;
  const res = await fetch(TM_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Cookie: EXISTING_COOKIE,
    },
    redirect: "manual",
  });
  return res.status === 200;
}

async function solveCaptcha(): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    console.error("[captcha] Opening Transfermarkt in Playwright...");
    await page.goto(TM_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);

    // Extract CAPTCHA params from page
    const params = await page.evaluate(() => {
      const props = (window as any).gokuProps;
      const scripts = [...document.querySelectorAll("script[src]")].map(
        (s) => s.getAttribute("src") || "",
      );
      return {
        sitekey: props?.key,
        iv: props?.iv,
        context: props?.context,
        challengeScript: scripts.find((s) => s.includes("challenge.js")),
        captchaScript: scripts.find((s) => s.includes("captcha.js")),
      };
    });

    if (!params.sitekey) throw new Error("No gokuProps found on page");

    // Submit to 2captcha
    console.error("[captcha] Submitting to 2captcha...");
    const createRes = await fetch("https://api.2captcha.com/createTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: API_KEY,
        task: {
          type: "AmazonTaskProxyless",
          websiteURL: TM_URL,
          websiteKey: params.sitekey,
          iv: params.iv,
          context: params.context,
          challengeScript: params.challengeScript,
          captchaScript: params.captchaScript,
        },
      }),
    });
    const { taskId, errorId, errorDescription } = await createRes.json();
    if (errorId) throw new Error(`2captcha submit failed: ${errorDescription}`);
    console.error(`[captcha] Task ${taskId}, polling...`);

    // Poll for voucher
    let voucher = "";
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      const pollRes = await fetch("https://api.2captcha.com/getTaskResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: API_KEY, taskId }),
      });
      const data = await pollRes.json();
      if (data.status === "ready") {
        voucher = data.solution.captcha_voucher;
        break;
      }
      if (data.errorId) throw new Error(`2captcha solve failed: ${data.errorDescription}`);
      console.error(`[captcha] Waiting... (${i + 1}/${MAX_POLLS})`);
    }
    if (!voucher) throw new Error("2captcha timed out");

    // Inject voucher into page via AWS WAF SDK
    console.error("[captcha] Injecting voucher...");
    await page.evaluate(async (v) => {
      await (window as any).ChallengeScript.submitCaptcha(v);
    }, voucher);
    await page.waitForTimeout(3000);

    // Extract cookie
    const cookies = await context.cookies();
    const wafCookie = cookies.find((c) => c.name === "aws-waf-token");
    if (!wafCookie) throw new Error("No aws-waf-token cookie set after voucher injection");

    return `aws-waf-token=${wafCookie.value}`;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.error("[captcha] Checking existing cookie...");
  if (await isExistingCookieValid()) {
    console.error("[captcha] Existing cookie still valid, skipping solve.");
    console.log(EXISTING_COOKIE);
    return;
  }
  console.error("[captcha] Cookie expired, solving...");
  const cookie = await solveCaptcha();

  // Verify the token actually works before outputting
  console.error("[captcha] Verifying solved token...");
  const verify = await fetch("https://www.transfermarkt.com/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Cookie: cookie,
    },
    redirect: "manual",
  });
  if (verify.status !== 200) {
    throw new Error(`Solved token failed verification (HTTP ${verify.status})`);
  }

  console.log(cookie);
  console.error("[captcha] Done!");
}

main().catch((err) => {
  console.error("[captcha] Fatal:", err);
  process.exit(1);
});
