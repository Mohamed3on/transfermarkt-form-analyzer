const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Cache-Control": "no-cache",
};

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;
let maxConcurrent = 4;

/** Override the concurrency limit (e.g. for batch scripts with their own backoff). */
export function setMaxConcurrent(n: number) {
  maxConcurrent = n;
}

let active = 0;
const queue: (() => void)[] = [];

async function acquireSlot() {
  while (active >= maxConcurrent) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  active++;
}

function releaseSlot() {
  active--;
  queue.shift()?.();
}

export async function fetchPage(
  url: string,
  revalidate?: number,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  await acquireSlot();
  try {
    return await fetchPageInner(url, revalidate, extraHeaders);
  } finally {
    releaseSlot();
  }
}

async function fetchPageInner(
  url: string,
  revalidate?: number,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const headers = { ...HEADERS, ...extraHeaders };
  const cacheOpts =
    revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" as const };
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { headers, ...cacheOpts });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const html = await response.text();
      // Transfermarkt rate-limit responses are ~146 bytes
      if (html.length > 500) return html;
      console.warn(
        `[fetch] Rate limited (${html.length}b), retry ${attempt + 1}/${MAX_RETRIES}: ${url}`,
      );
    } catch (err) {
      console.warn(
        `[fetch] ${err instanceof Error ? err.message : err}, retry ${attempt + 1}/${MAX_RETRIES}: ${url}`,
      );
    }
    if (attempt < MAX_RETRIES - 1) {
      const jitter = Math.random() * 500;
      await new Promise((r) => setTimeout(r, BASE_DELAY * 2 ** attempt + jitter));
    }
  }
  throw new Error(`[fetch] Failed after ${MAX_RETRIES} retries: ${url}`);
}
