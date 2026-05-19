"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import type { FeatureStatus, MarketFeature, SelectOption } from "@/lib/market-data";
import type { MarketSnapshot, MarketStats, VoteAggregate } from "@/lib/market-repository";
import { FAQ_ITEMS, PRIMARY_ACTION_LINES, SEMANTIC_SUMMARY_CARDS, TARGET_AUDIENCE_LINES } from "@/lib/site";

type MarketVoteClientProps = {
  features: MarketFeature[];
  segmentOptions: SelectOption[];
  regionOptions: SelectOption[];
  blockerOptions: SelectOption[];
  followupOptions: SelectOption[];
  contactMethodOptions: SelectOption[];
};

type SubmitResponse = {
  submissionId: string;
  recordedVotes: number;
  stats: MarketStats;
};

const emptyStats: MarketStats = {
  pageViewCount: 0,
  totalSubmissions: 0,
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
    title: "先看我们能帮什么",
    body: "每个方向都压缩成一句话服务说明，你只需要判断自己是否愿意使用或继续了解。",
  },
  {
    title: "愿意再留下线索",
    body: "服务兴趣、受众类型和可联系样本数量，会用来判断哪个人群值得优先服务。",
  },
  {
    title: "按阶段推出",
    body: "P0 先做出发前最刚需的问题，P1 扩展到细分人群，P2 再发展资源网络和工具。",
  },
];

function optionLabel(options: SelectOption[], value: string | null) {
  if (!value) {
    return "暂无";
  }

  return options.find((option) => option.value === value)?.label ?? value;
}

function formatInterestLabel(aggregate?: VoteAggregate) {
  const voteCount = aggregate?.voteCount ?? 0;
  return `${voteCount} 人感兴趣`;
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
    return "当某类人群足够集中后，再做更细分的服务。";
  }

  return "等需求和供给都更明确后，再建设长期能力。";
}

export function MarketVoteClient({
  blockerOptions,
  contactMethodOptions,
  features,
  followupOptions,
  regionOptions,
  segmentOptions,
}: MarketVoteClientProps) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [segment, setSegment] = useState(segmentOptions[0]?.value ?? "early_explorer");
  const [targetRegion, setTargetRegion] = useState(regionOptions[0]?.value ?? "undecided");
  const [biggestBlocker, setBiggestBlocker] = useState(blockerOptions[0]?.value ?? "not_sure");
  const [followupPreference, setFollowupPreference] = useState(followupOptions[0]?.value ?? "receive_result");
  const [contactMethod, setContactMethod] = useState(contactMethodOptions[0]?.value ?? "wechat");
  const [contactValue, setContactValue] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [consentToContact, setConsentToContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          setErrorMessage("暂时无法读取服务兴趣统计，但仍可提交新的兴趣信号。");
        }
      }
    }

    void loadSnapshot();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = snapshot?.stats ?? emptyStats;
  const selectedFeatureSet = useMemo(() => new Set(selectedFeatureIds), [selectedFeatureIds]);
  const topFeature = features.find((feature) => feature.id === stats.topFeatureId) ?? null;
  const p0Features = features.filter((feature) => feature.status === "p0");
  const p1Features = features.filter((feature) => feature.status === "p1");
  const p2Features = features.filter((feature) => feature.status === "p2");

  function handleFeatureToggle(featureId: string) {
    setSelectedFeatureIds((currentFeatureIds) =>
      currentFeatureIds.includes(featureId)
        ? currentFeatureIds.filter((selectedFeatureId) => selectedFeatureId !== featureId)
        : [...currentFeatureIds, featureId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (selectedFeatureIds.length === 0) {
      setErrorMessage("请选择至少一个你愿意使用或想继续了解的服务。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/market-vote/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedFeatureIds,
          profile: {
            segment,
            city: "",
            workMode: "not_remote_yet",
            decisionTimeline: "researching",
            budgetLevel: "free_research",
            targetRegion,
            biggestBlocker,
            followupPreference,
          },
          contact: {
            name: "",
            method: contactMethod,
            value: contactValue,
            consentToContact,
            note: contactNote,
          },
        }),
      });
      const payload = (await response.json()) as SubmitResponse | { message?: string };

      if (!response.ok || !("submissionId" in payload)) {
        throw new Error("message" in payload ? payload.message : "提交失败");
      }

      setSnapshot({ features, stats: payload.stats });
      setSuccessMessage(`已记录你的服务兴趣 ${payload.submissionId}，谢谢你给我们一个真实信号。`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="market-photo border-b border-white/10 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:py-12">
          <div className="min-w-0 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-sm">Go Nomad ADV</p>
            <h1 className="break-words text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">我们可以帮你把数字游民这件事先判断清楚</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/86 sm:text-base lg:text-lg">
              看完下面的一句话服务说明，勾选你愿意使用或想继续了解的方向。我们会根据兴趣数量、留资和人群画像，决定先推出哪一类服务。
            </p>
          </div>

          <div className="grid gap-3 self-end rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
            <MetricRow label="浏览量" value={String(stats.pageViewCount)} />
            <MetricRow label="已表达兴趣" value={String(stats.totalSubmissions)} />
            <MetricRow label="愿意联系" value={String(stats.contactableSubmissions)} />
            <MetricRow label="最多人想了解" value={topFeature?.title ?? "等待第一条兴趣"} />
            <MetricRow label="主要人群" value={optionLabel(segmentOptions, stats.primarySegment)} />
            <MetricRow label="主要顾虑" value={optionLabel(blockerOptions, stats.topBlocker)} />
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:py-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] lg:gap-8">
          <div className="min-w-0 space-y-7">
            <ServicePrinciples />
            <SemanticSummarySection />
            <FaqSection />
            <FeatureSection
              features={p0Features}
              selectedFeatureSet={selectedFeatureSet}
              stats={stats}
              title={stageTitle("p0")}
              description={stageDescription("p0")}
              onToggle={handleFeatureToggle}
            />
            <FeatureSection
              features={p1Features}
              selectedFeatureSet={selectedFeatureSet}
              stats={stats}
              title={stageTitle("p1")}
              description={stageDescription("p1")}
              onToggle={handleFeatureToggle}
            />
            <FeatureSection
              features={p2Features}
              selectedFeatureSet={selectedFeatureSet}
              stats={stats}
              title={stageTitle("p2")}
              description={stageDescription("p2")}
              onToggle={handleFeatureToggle}
            />
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-5 lg:self-start">
            <section className="rounded-lg border bg-surface p-4 shadow-sm sm:p-5">
              <SectionHeading eyebrow="Profile" title="你大概是哪类用户" />
              <div className="mt-5 grid gap-4">
                <SelectField label="你更接近哪类人" options={segmentOptions} value={segment} onChange={setSegment} />
                <SelectField label="你主要关注哪里" options={regionOptions} value={targetRegion} onChange={setTargetRegion} />
                <SelectField label="现在最担心什么" options={blockerOptions} value={biggestBlocker} onChange={setBiggestBlocker} />
              </div>
            </section>

            <section className="rounded-lg border bg-surface p-4 shadow-sm sm:p-5">
              <SectionHeading eyebrow="Contact" title="愿意了解时留下方式" />
              <div className="mt-5 grid gap-4">
                <SelectField label="后续希望怎么参与" options={followupOptions} value={followupPreference} onChange={setFollowupPreference} />
                <SelectField label="联系渠道" options={contactMethodOptions} value={contactMethod} onChange={setContactMethod} />
                <TextField label="联系方式" placeholder="微信号 / 手机 / 邮箱，可不填" value={contactValue} onChange={setContactValue} />
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  补充一句
                  <textarea
                    className="focus-ring min-h-20 resize-y rounded-md border bg-white px-3 py-2 text-sm text-foreground shadow-inner"
                    maxLength={600}
                    placeholder="可以写你最想先解决的问题，可不填"
                    value={contactNote}
                    onChange={(event) => setContactNote(event.target.value)}
                  />
                </label>
                <label className="flex items-start gap-3 rounded-md border bg-surface-soft p-3 text-sm text-muted">
                  <input
                    checked={consentToContact}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand-teal"
                    type="checkbox"
                    onChange={(event) => setConsentToContact(event.target.checked)}
                  />
                  <span>同意 Go Nomad 后续基于本次服务兴趣联系我。</span>
                </label>
              </div>
            </section>

            {errorMessage ? <StatusMessage tone="error" message={errorMessage} /> : null}
            {successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}

            <button
              className="focus-ring w-full rounded-md bg-brand-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d675f] disabled:cursor-not-allowed disabled:bg-muted sm:text-base"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "提交中" : "提交我的服务兴趣"}
            </button>
          </aside>
        </div>
      </form>
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

function SemanticSummarySection() {
  return (
    <section className="rounded-lg border bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <SectionHeading eyebrow="Overview" title="这页是什么，适合谁，以及提交后会发生什么" />
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            这一段是给搜索引擎、AI 搜索和第一次访问的人看的直接说明：Go Nomad ADV 用真实服务兴趣来判断，哪些中国市场数字游民服务应该优先推出。
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
  selectedFeatureSet,
  stats,
  title,
  onToggle,
}: {
  description: string;
  features: MarketFeature[];
  selectedFeatureSet: Set<string>;
  stats: MarketStats;
  title: string;
  onToggle: (featureId: string) => void;
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
        {features.map((feature) => (
          <FeatureInterestRow
            aggregate={stats.votesByFeature[feature.id]}
            feature={feature}
            isSelected={selectedFeatureSet.has(feature.id)}
            key={feature.id}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureInterestRow({
  aggregate,
  feature,
  isSelected,
  onToggle,
}: {
  aggregate?: VoteAggregate;
  feature: MarketFeature;
  isSelected: boolean;
  onToggle: (featureId: string) => void;
}) {
  const stageClass =
    feature.status === "p0"
      ? "bg-brand-leaf/10 text-brand-leaf"
      : feature.status === "p1"
        ? "bg-brand-gold/12 text-brand-gold"
        : "bg-brand-teal/10 text-brand-teal";

  return (
    <label className={`grid min-w-0 cursor-pointer gap-4 rounded-lg border bg-surface p-4 shadow-sm transition sm:grid-cols-[1fr_auto] sm:items-center sm:p-5 ${isSelected ? "border-brand-teal ring-2 ring-brand-teal/15" : "hover:border-brand-teal/45"}`}>
      <input checked={isSelected} className="sr-only" type="checkbox" onChange={() => onToggle(feature.id)} />
      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageClass}`}>{feature.stageLabel}</span>
          <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-muted">{formatInterestLabel(aggregate)}</span>
        </span>
        <span className="mt-3 block break-words text-base font-semibold leading-snug text-foreground sm:text-lg">{feature.title}</span>
        <span className="mt-2 block text-sm leading-6 text-muted">{feature.summary}</span>
        <span className="mt-3 flex flex-wrap gap-2">
          {feature.tags.map((tag) => (
            <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs text-muted" key={tag}>
              {tag}
            </span>
          ))}
        </span>
      </span>
      <span className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold ${isSelected ? "border-brand-teal bg-brand-teal text-white" : "bg-white text-foreground"}`}>
        {isSelected ? "已选择" : "愿意使用 / 想了解"}
      </span>
    </label>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <input
        className="focus-ring h-11 min-w-0 rounded-md border bg-white px-3 text-sm text-foreground shadow-inner"
        maxLength={160}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <select
        className="focus-ring h-11 min-w-0 rounded-md border bg-white px-3 text-sm text-foreground shadow-inner"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusMessage({ message, tone }: { message: string; tone: "error" | "success" }) {
  const className =
    tone === "error"
      ? "border-brand-coral/30 bg-brand-coral/10 text-brand-coral"
      : "border-brand-teal/30 bg-brand-teal/10 text-brand-teal";

  return <p className={`rounded-md border px-4 py-3 text-sm font-semibold leading-6 ${className}`}>{message}</p>;
}