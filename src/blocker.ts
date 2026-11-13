/**
 * Strict Distraction Blocker
 * Strictly blocks Social Media (SNS), YouTube, Pinterest, and entertainment websites.
 * Only allows user-approved study and work websites.
 */

export const BLOCKED_DOMAINS: string[] = [
  // Video & Entertainment Streaming
  'youtube.com',
  'youtu.be',
  'm.youtube.com',
  'music.youtube.com',
  'netflix.com',
  'disneyplus.com',
  'watcha.com',
  'tving.com',
  'wavve.com',
  'twitch.tv',
  'chzzk.naver.com',
  'afreecatv.com',
  'sooplive.co.kr',
  'bilibili.com',

  // SNS & Social Networks & Visual Boards
  'pinterest.com',
  'pinterest.co.kr',
  'instagram.com',
  'facebook.com',
  'fb.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'reddit.com',
  'threads.net',
  'tumblr.com',
  'snapchat.com',
  'weibo.com',

  // Entertainment Communities & Webtoons
  'dcinside.com',
  'fmkorea.com',
  'theqoo.net',
  'instiz.net',
  'clien.net',
  'ruliweb.com',
  'humoruniv.com',
  'nate.com/pann',
  'webtoons.com',
  'comic.naver.com',
  'webtoon.kakao.com',
  'page.kakao.com'
];

export const BLOCKED_KEYWORDS: string[] = [
  'youtube',
  'youtu.be',
  'pinterest',
  'instagram',
  'facebook',
  'twitter',
  'tiktok',
  'reddit',
  'twitch',
  'threads.net',
  'dcinside',
  'fmkorea',
  'webtoon'
];

export interface ValidationResult {
  valid: boolean;
  normalizedUrl: string;
  hostname: string;
  reason?: string;
}

/**
 * Normalizes input string to a valid URL object
 */
export function normalizeUrl(inputUrl: string): { url: URL; normalized: string } | null {
  let cleaned = inputUrl.trim();
  if (!cleaned) return null;

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    return { url: parsed, normalized: parsed.origin + parsed.pathname + parsed.search };
  } catch {
    return null;
  }
}

/**
 * Checks if a URL or domain belongs to the blocked SNS/YouTube/Pinterest list
 */
export function checkIsBlocked(urlOrDomain: string): { isBlocked: boolean; matchedReason?: string } {
  const norm = normalizeUrl(urlOrDomain);
  const target = norm ? norm.url.hostname.toLowerCase() : urlOrDomain.toLowerCase().trim();

  // Check exact/subdomain match
  for (const blocked of BLOCKED_DOMAINS) {
    if (target === blocked || target.endsWith('.' + blocked)) {
      return {
        isBlocked: true,
        matchedReason: `"${blocked}" 관련 사이트는 집중을 위해 접근이 차단되어 있습니다. (SNS, 유튜브, 핀터레스트 불가)`
      };
    }
  }

  // Check keyword matches in hostname
  for (const keyword of BLOCKED_KEYWORDS) {
    if (target.includes(keyword)) {
      return {
        isBlocked: true,
        matchedReason: `"${keyword}"(SNS/동영상/오락 사이트) 관련 도메인은 집중을 위해 등록할 수 없습니다.`
      };
    }
  }

  return { isBlocked: false };
}

/**
 * Validates whether a new site can be added to the whitelist
 */
export function validateProductiveSiteUrl(input: string): ValidationResult {
  const parsed = normalizeUrl(input);
  if (!parsed) {
    return {
      valid: false,
      normalizedUrl: '',
      hostname: '',
      reason: '올바른 웹사이트 주소(URL)를 입력해주세요 (예: ucampus.knou.ac.kr, notion.so)'
    };
  }

  const blockedCheck = checkIsBlocked(parsed.url.hostname);
  if (blockedCheck.isBlocked) {
    return {
      valid: false,
      normalizedUrl: parsed.normalized,
      hostname: parsed.url.hostname,
      reason: blockedCheck.matchedReason || 'SNS, 유튜브, 핀터레스트 등 집중을 방해하는 사이트는 등록할 수 없습니다.'
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.normalized,
    hostname: parsed.url.hostname
  };
}
