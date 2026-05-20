"use client";

import { useEffect, useState } from "react";

import type { FeatureStatus, MarketFeature } from "@/lib/market-data";
import type { InterestDecision, MarketSnapshot, MarketStats } from "@/lib/market-repository";
import { FAQ_ITEMS, PRIMARY_ACTION_LINES, SEMANTIC_SUMMARY_CARDS, TARGET_AUDIENCE_LINES } from "@/lib/site";

type MarketVoteClientProps = {
  features: MarketFeature[];
};

type SubmitResponse = {
  submissionId: string;
  interestDecision: InterestDecision;
  stats: MarketStats;
};

const emptyStats: MarketStats = {
  pageViewCount: 0,
  totalSubmissions: 0,
  interestedSubmissions: 0,
  notInterestedSubmissions: 0,
  interestRate: 0,
  contactableSubmissions: 0,
  topFeatureId: null,
  primarySegment: null,
  topBlocker: null,
  votesByFeature: {},
  segmentsByAudience: {},
  blockersByIssue: {},
  regionsByInterest: {},
  followupsByPreference: {},
  recentSignals: [],
};

const servicePrinciples = [
  {
    title: "先看服务，不先填表",
    body: "每个方向都压缩成一句话，先帮你判断这套服务到底是不是你会用的东西。",
  },
  {
    title: "只回答一个问题",
    body: "不需要留联系方式，也不需要填画像，只要点感兴趣或不感兴趣。",
  },
  {
    title: "按真实反馈决定投入",
    body: "我们用整体兴趣率，而不是留资数量，来判断这套服务值不值得继续往下做。",
  },
];

function formatInterestRate(rate: number, totalSubmissions: number) {
  if (totalSubmissions === 0) {
    return "等待第一批反馈";
  }

  return `${Math.round(rate * 100)}%`;
}

function stageTitle(status: FeatureStatus) {
  if (status === "p0") {
    return "P0：最先可能推出";
  }

  if (status === "p1") {
    return "P1：有人群后扩展";
  }

  return "P2：网络和工具";
}

function stageDescription(status: FeatureStatus) {
  if (status === "p0") {
    return "先解决用户看到服务后最容易点头的出发前问题。";
  }

  if (status === "p1") {
    return "当整体兴趣稳定后，再判断是否要往更细分的人群扩展。";
  }

  return "等需求和供给都更明确后，再建设长期能力。";
}

export function MarketVoteClient({ features }: MarketVoteClientProps) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [pendingDecision, setPendingDecision] = useState<InterestDecision | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/market-vote/snapshot", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("snapshot request failed");
        }
        const payload = (await response.json()) as MarketSnapshot;
        if (isActive) {
          setSnapshot(payload);
        }
      } catch {
        if (isActive) {
          setErrorMessage("暂时无法读取反馈统计，但你仍然可以提交新的兴趣信号。");
        }
      }
    }

    void loadSnapshot();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = snapshot?.stats ?? emptyStats;
  const p0Features = features.filter((feature) => feature.status === "p0");
  const p1Features = features.filter((feature) => feature.status === "p1");
  const p2Features = features.filter((feature) => feature.status === "p2");

  async function handleDecision(interestDecision: InterestDecision) {
    setPendingDecision(interestDecision);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/market-vote/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interestDecision }),
      });
      const payload = (await response.json()) as SubmitResponse | { message?: string };

      if (!response.ok || !("submissionId" in payload)) {
        throw new Error("message" in payload ? payload.message : "提交失败");
      }

      setSnapshot({ features, stats: payload.stats });
      setSuccessMessage(
        interestDecision === "interested"
          ? `已记录你对这套服务感兴趣，反馈编号 ${payload.submissionId}。`
          : `已记录你目前对这套服务不感兴趣，反馈编号 ${payload.submissionId}。`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setPendingDecision(null);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="market-photo border-b border-white/10 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:py-12">
          <div className="min-w-0 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-sm">Go Nomad ADV</p>
            <h1 className="break-words text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">我们可以帮你先判断，这套数字游民服务值不值得做</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/86 sm:text-base lg:text-lg">
              你只需要看完下面的服务说明，然后点一下感兴趣或不感兴趣。我们要知道的不是谁愿意留联系方式，而是这套服务整体有没有真实需求。
            </p>
          </div>

          <div className="grid gap-3 self-end rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
            <MetricRow label="浏览量" value={String(stats.pageViewCount)} />
            <MetricRow label="总反馈" value={String(stats.totalSubmissions)} />
            <MetricRow label="感兴趣" value={String(stats.interestedSubmissions)} />
            <MetricRow label="不感兴趣" value={String(stats.notInterestedSubmissions)} />
            <MetricRow label="兴趣率" value={formatInterestRate(stats.interestRate, stats.totalSubmissions)} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 md:px-8 lg:py-9">
        <ServicePrinciples />
        <DecisionPanel
          errorMessage={errorMessage}
          pendingDecision={pendingDecision}
          stats={stats}
          successMessage={successMessage}
          onDecision={handleDecision}
        />
        <SemanticSummarySection />
        <FaqSection />
        <FeatureSection features={p0Features} title={stageTitle("p0")} description={stageDescription("p0")} />
        <FeatureSection features={p1Features} title={stageTitle("p1")} description={stageDescription("p1")} />
        <FeatureSection features={p2Features} title={stageTitle("p2")} description={stageDescription("p2")} />
      </div>
    </main>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/12 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-white/72 sm:text-sm">{label}</span>
      <span className="min-w-0 text-right text-xs font-semibold text-white sm:text-sm">{value}</span>
    </div>
  );
}

function ServicePrinciples() {
  return (
    <section className="grid min-w-0 gap-3 sm:grid-cols-3">
      {servicePrinciples.map((principle) => (
        <article className="min-w-0 rounded-lg border bg-surface p-4 shadow-sm" key={principle.title}>
          <h2 className="text-base font-semibold text-foreground">{principle.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{principle.body}</p>
        </article>
      ))}
    </section>
  );
}

function DecisionPanel({
  errorMessage,
  pendingDecision,
  stats,
  successMessage,
  onDecision,
}: {
  errorMessage: string;
  pendingDecision: InterestDecision | null;
  stats: MarketStats;
  successMessage: string;
  onDecision: (interestDecision: InterestDecision) => void;
}) {
  return (
    <section className="rounded-lg border bg-surface p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
        <div className="min-w-0">
          <SectionHeading eyebrow="Decision" title="看完后只回答一个问题" />
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            你对 Go Nomad 这套服务整体是否感兴趣？不需要留下联系方式，也不需要选择具体功能，点击一次就会直接记入统计。
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            当前共有 {stats.totalSubmissions} 次反馈，其中 {stats.interestedSubmissions} 次感兴趣，{stats.notInterestedSubmissions} 次不感兴趣。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DecisionButton
            disabled={pendingDecision !== null}
            isPrimary
            label={pendingDecision === "interested" ? "提交中..." : "感兴趣"}
            onClick={() => onDecision("interested")}
          />
          <DecisionButton
            disabled={pendingDecision !== null}
            label={pendingDecision === "not_interested" ? "提交中..." : "不感兴趣"}
            onClick={() => onDecision("not_interested")}
          />
        </div>
      </div>

      {errorMessage ? <div className="mt-4"><StatusMessage tone="error" message={errorMessage} /></div> : null}
      {successMessage ? <div className="mt-4"><StatusMessage tone="success" message={successMessage} /></div> : null}
    </section>
  );
}

function DecisionButton({
  disabled,
  isPrimary = false,
  label,
  onClick,
}: {
  disabled: boolean;
  isPrimary?: boolean;
  label: string;
  onClick: () => void;
}) {
  const className = isPrimary
    ? "bg-brand-teal text-white hover:bg-[#0d675f]"
    : "bg-white text-foreground hover:border-foreground/25 hover:bg-surface-soft";

  return (
    <button
      className={`focus-ring min-h-14 rounded-md border px-5 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted disabled:text-white sm:text-base ${className}`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SemanticSummarySection() {
  return (
    <section className="rounded-lg border bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <SectionHeading eyebrow="Overview" title="这页是什么，适合谁，以及提交后会发生什么" />
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            这一段是给搜索引擎、AI 搜索和第一次访问的人看的直接说明：Go Nomad ADV 用整体感兴趣 / 不感兴趣信号来判断，这套面向中国市场的数字游民服务是否值得继续投入。
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {SEMANTIC_SUMMARY_CARDS.map((card) => (
          <article className="rounded-lg border bg-surface-soft p-4" key={card.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-coral">{card.eyebrow}</p>
            <h3 className="mt-2 text-base font-semibold leading-6 text-foreground">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="rounded-lg border bg-white p-4 shadow-inner">
          <h3 className="text-sm font-semibold text-foreground">主要适合这些人</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {TARGET_AUDIENCE_LINES.map((line) => (
              <span className="rounded-full bg-surface-soft px-3 py-1.5 text-xs text-muted" key={line}>
                {line}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-lg border bg-white p-4 shadow-inner">
          <h3 className="text-sm font-semibold text-foreground">你在这页可以做什么</h3>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {PRIMARY_ACTION_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="rounded-lg border bg-surface p-5 shadow-sm sm:p-6" id="faq">
      <div className="min-w-0">
        <SectionHeading eyebrow="FAQ" title="搜索和 AI 最常问的几个问题" />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          这些答案和页面里的结构化数据保持一致，用来直接说明这页是不是收费流程、谁适合看、以及提交兴趣后会发生什么。
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {FAQ_ITEMS.map((item) => (
          <article className="rounded-lg border bg-white p-4 shadow-inner sm:p-5" key={item.question}>
            <h3 className="text-base font-semibold leading-6 text-foreground">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-coral">{eyebrow}</p>
      <h2 className="mt-1 break-words text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
    </div>
  );
}

function FeatureSection({
  description,
  features,
  title,
}: {
  description: string;
  features: MarketFeature[];
  title: string;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <SectionHeading eyebrow="Services" title={title} />
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <span className="shrink-0 text-sm text-muted">{features.length} 项</span>
      </div>
      <div className="grid min-w-0 gap-3">
        {features.map((feature) => <FeatureCard feature={feature} key={feature.id} />)}
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
}: {
  feature: MarketFeature;
}) {
  const stageClass =
    feature.status === "p0"
      ? "bg-brand-leaf/10 text-brand-leaf"
      : feature.status === "p1"
        ? "bg-brand-gold/12 text-brand-gold"
        : "bg-brand-teal/10 text-brand-teal";

  return (
    <article className="rounded-lg border bg-surface p-4 shadow-sm transition hover:border-brand-teal/45 sm:p-5">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageClass}`}>{feature.stageLabel}</span>
        <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-muted">服务说明</span>
      </div>
      <h3 className="mt-3 break-words text-base font-semibold leading-snug text-foreground sm:text-lg">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{feature.summary}</p>
      <p className="mt-3 text-sm leading-6 text-muted">这条服务的验证问题是：{feature.marketSignal}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {feature.tags.map((tag) => (
          <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs text-muted" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function StatusMessage({ message, tone }: { message: string; tone: "error" | "success" }) {
  const className =
    tone === "error"
      ? "border-brand-coral/30 bg-brand-coral/10 text-brand-coral"
      : "border-brand-teal/30 bg-brand-teal/10 text-brand-teal";

  return <p className={`rounded-md border px-4 py-3 text-sm font-semibold leading-6 ${className}`}>{message}</p>;
}