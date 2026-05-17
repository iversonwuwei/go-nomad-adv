import type { MarketFeature } from "@/lib/market-data";

const DEFAULT_SITE_URL = "https://vote.go-nomads.com";
const LOCAL_SITE_URL = "http://localhost:6003";

export const SITE_NAME = "Go Nomad ADV";
export const SITE_TITLE = "Go Nomad ADV | 数字游民服务说明与兴趣收集";
export const SITE_DESCRIPTION =
  "Go Nomad 面向中国市场的数字游民服务说明、兴趣收集与受众画像入口，帮助访客判断出发可行性、签证与税务风险、远程出境工作沟通等服务方向。";
export const SOCIAL_IMAGE_ALT = "Go Nomad ADV social preview";
export const SOCIAL_IMAGE_PATH = "/opengraph-image";
export const TWITTER_IMAGE_PATH = "/twitter-image";
export const SITE_KEYWORDS = [
  "Go Nomad ADV",
  "数字游民",
  "数字游民服务",
  "中国市场数字游民",
  "远程出境工作",
  "签证税务风险",
  "跨境收款",
  "数字游民路线规划",
];

export const SEMANTIC_SUMMARY_CARDS = [
  {
    eyebrow: "这页是什么",
    title: "Go Nomad 在验证哪些数字游民服务值得先做",
    body: "这不是付款或预约页面，而是一个面向中国市场的数字游民服务说明与真实兴趣验证入口。",
  },
  {
    eyebrow: "适合谁看",
    title: "远程员工、自由职业者、创作者、家庭与小团队",
    body: "如果你正在判断能否出发、去哪、签证税务风险怎么避开，或者想梳理跨境收款与家庭路线，这页就是给你看的。",
  },
  {
    eyebrow: "提交后意味着什么",
    title: "Go Nomad 会按真实需求决定 P0、P1、P2 优先级",
    body: "你勾选的服务兴趣、人群画像和主要顾虑，会帮助 Go Nomad 判断先上线哪类数字游民服务，不会直接触发收费或预约。",
  },
] as const;

export const TARGET_AUDIENCE_LINES = [
  "想了解数字游民但还没开始的中国用户",
  "远程员工、自由职业者、创作者、创始人和家庭规划者",
  "顾问、本地资源伙伴与企业运营角色",
] as const;

export const PRIMARY_ACTION_LINES = [
  "在页面勾选愿意使用或继续了解的服务方向。",
  "可选填写人群画像、地区偏好、主要顾虑与联系方式。",
] as const;

export const FAQ_ITEMS = [
  {
    question: "Go Nomad ADV 这是什么页面？",
    answer: "这是 Go Nomad 面向中国市场的数字游民服务说明与需求验证页面，用来判断哪些服务方向最值得优先推出。",
  },
  {
    question: "这是不是付款、预约或正式下单页面？",
    answer: "不是。这一页只用于说明潜在服务并收集真实兴趣、人群画像和可选联系方式，不会直接触发付款、预约或正式订单。",
  },
  {
    question: "谁最适合使用这页？",
    answer: "适合正在评估跨境远程工作、数字游民路线、签证税务风险、跨境收款或家庭出行安排的中国用户，以及相关顾问和合作伙伴。",
  },
  {
    question: "提交兴趣后会发生什么？",
    answer: "你提交的服务兴趣、主要顾虑和可选联系方式，会帮助 Go Nomad 判断 P0、P1、P2 哪类服务应该先上线；它本身不会改变你的账户状态或创建付费流程。",
  },
] as const;

const AI_SUMMARY_LINES = SEMANTIC_SUMMARY_CARDS.map((card) => card.body);

function parseUrl(candidate: string | undefined) {
  if (!candidate) {
    return null;
  }

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const configuredSiteUrl =
    parseUrl(process.env.GO_NOMAD_ADV_SITE_URL) ??
    parseUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    parseUrl(process.env.SITE_URL);

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  return process.env.NODE_ENV === "development" ? new URL(LOCAL_SITE_URL) : new URL(DEFAULT_SITE_URL);
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildStructuredData(features: MarketFeature[]) {
  const organizationId = getAbsoluteUrl("/#organization");
  const websiteId = getAbsoluteUrl("/#website");
  const webpageId = getAbsoluteUrl("/#webpage");
  const faqId = getAbsoluteUrl("/#faq");

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: getAbsoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/icon-512.png"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      url: getAbsoluteUrl("/"),
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "zh-CN",
      publisher: {
        "@id": organizationId,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": webpageId,
      url: getAbsoluteUrl("/"),
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      image: getAbsoluteUrl(SOCIAL_IMAGE_PATH),
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: getAbsoluteUrl(SOCIAL_IMAGE_PATH),
        width: 1200,
        height: 630,
      },
      inLanguage: "zh-CN",
      isPartOf: {
        "@id": websiteId,
      },
      about: [
        { "@type": "Thing", name: "中国市场数字游民服务" },
        { "@type": "Thing", name: "远程出境工作决策" },
        { "@type": "Thing", name: "签证与税务风险提醒" },
      ],
      audience: [
        { "@type": "Audience", audienceType: "中国远程员工与自由职业者" },
        { "@type": "Audience", audienceType: "创始人、小团队与家庭规划者" },
      ],
      mainEntity: {
        "@type": "ItemList",
        name: "Go Nomad ADV 服务阶段",
        itemListElement: features.map((feature, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            name: feature.title,
            description: feature.summary,
            category: feature.stageLabel,
            serviceType: feature.stageLabel,
            areaServed: "中国用户的跨境工作与数字游民场景",
            keywords: feature.tags.join("、"),
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": faqId,
      url: `${getAbsoluteUrl("/")}#faq`,
      inLanguage: "zh-CN",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];
}

export function buildLlmsText(features: MarketFeature[]) {
  return [
    `# ${SITE_NAME}`,
    "",
    "> Go Nomad 的中国市场数字游民服务说明与兴趣收集页面。",
    "",
    "## Canonical URL",
    getAbsoluteUrl("/"),
    "",
    "## Summary",
    ...AI_SUMMARY_LINES.map((line) => `- ${line}`),
    "",
    "## Target Audiences",
    ...TARGET_AUDIENCE_LINES.map((line) => `- ${line}`),
    "",
    "## Service Stages",
    ...features.map((feature) => `- ${feature.stageLabel}: ${feature.title} - ${feature.summary}`),
    "",
    "## Primary Action",
    ...PRIMARY_ACTION_LINES.map((line) => `- ${line}`),
    "",
    "## FAQ",
    ...FAQ_ITEMS.flatMap((item) => [`- Q: ${item.question}`, `  A: ${item.answer}`]),
    "",
    "## Machine-readable Notes",
    "- This page is a research and demand validation page, not a payment or booking flow.",
    "- The page helps determine which digital nomad service line Go Nomad should launch first for China-market users.",
    "",
    "## Resources",
    `- Sitemap: ${getAbsoluteUrl("/sitemap.xml")}`,
    `- Robots: ${getAbsoluteUrl("/robots.txt")}`,
    `- Open Graph Image: ${getAbsoluteUrl(SOCIAL_IMAGE_PATH)}`,
  ].join("\n");
}