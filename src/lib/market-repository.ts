import { randomUUID } from "node:crypto";

import {
    BLOCKER_OPTIONS,
    BUDGET_OPTIONS,
    CONTACT_METHOD_OPTIONS,
    FOLLOWUP_OPTIONS,
    getFeatureById,
    isKnownOption,
    MARKET_FEATURES,
    REGION_OPTIONS,
    SEGMENT_OPTIONS,
    TIMELINE_OPTIONS,
    WORK_MODE_OPTIONS,
    type MarketFeature,
    type SelectOption,
} from "./market-data";
import { getDatabase } from "./sqlite";

type SubmitProfile = {
  segment?: unknown;
  city?: unknown;
  workMode?: unknown;
  decisionTimeline?: unknown;
  budgetLevel?: unknown;
  targetRegion?: unknown;
  biggestBlocker?: unknown;
  followupPreference?: unknown;
};

type SubmitContact = {
  name?: unknown;
  method?: unknown;
  value?: unknown;
  consentToContact?: unknown;
  note?: unknown;
};

export type MarketSubmissionInput = {
  selectedFeatureIds?: unknown;
  priorityFeatureId?: unknown;
  profile?: SubmitProfile;
  contact?: SubmitContact;
};

export type VoteAggregate = {
  voteCount: number;
  voteScore: number;
  priorityCount: number;
};

export type RecentSignal = {
  segment: string;
  targetRegion: string;
  biggestBlocker: string;
  followupPreference: string;
  createdAt: string;
};

export type MarketStats = {
  totalSubmissions: number;
  contactableSubmissions: number;
  topFeatureId: string | null;
  primarySegment: string | null;
  topBlocker: string | null;
  votesByFeature: Record<string, VoteAggregate>;
  segmentsByAudience: Record<string, number>;
  blockersByIssue: Record<string, number>;
  regionsByInterest: Record<string, number>;
  followupsByPreference: Record<string, number>;
  recentSignals: RecentSignal[];
};

export type MarketSnapshot = {
  features: MarketFeature[];
  stats: MarketStats;
};

export type SubmitResult = {
  submissionId: string;
  recordedVotes: number;
  stats: MarketStats;
};

export class MarketInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketInputError";
  }
}

function createId(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

function trimText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function optionOrFallback(options: SelectOption[], value: unknown, fallback: string) {
  const normalizedValue = trimText(value, 80);
  if (normalizedValue && isKnownOption(options, normalizedValue)) {
    return normalizedValue;
  }

  return fallback;
}

function numberFromRow(row: Record<string, unknown> | undefined, key: string) {
  if (!row) {
    return 0;
  }

  const value = row[key];
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return Number(value ?? 0);
}

function stringFromRow(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : String(value ?? "");
}

function uniqueSelectedFeatures(value: unknown) {
  if (!Array.isArray(value)) {
    throw new MarketInputError("Select at least one feature to vote for");
  }

  const featureIds = value
    .map((item) => trimText(item, 120))
    .filter(Boolean);
  const uniqueFeatureIds = Array.from(new Set(featureIds));

  if (uniqueFeatureIds.length === 0) {
    throw new MarketInputError("Select at least one feature to vote for");
  }

  const unknownFeatureId = uniqueFeatureIds.find((featureId) => !getFeatureById(featureId));
  if (unknownFeatureId) {
    throw new MarketInputError(`Unknown feature id: ${unknownFeatureId}`);
  }

  return uniqueFeatureIds;
}

function aggregateCount(rows: Record<string, unknown>[], keyName: string) {
  return rows.reduce<Record<string, number>>((aggregates, row) => {
    aggregates[stringFromRow(row, keyName)] = numberFromRow(row, "count");
    return aggregates;
  }, {});
}

function topKey(aggregates: Record<string, number>) {
  return Object.entries(aggregates).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

export function getMarketStats(): MarketStats {
  const database = getDatabase();
  const submissionRow = database.prepare("SELECT COUNT(*) AS count FROM survey_submissions").get();
  const contactableRow = database
    .prepare(
      `SELECT COUNT(*) AS count
       FROM survey_submissions
       WHERE consent_to_contact = 1
         AND contact_value <> ''
         AND contact_method <> 'none'`,
    )
    .get();
  const voteRows = database
    .prepare(
      `SELECT feature_id AS featureId,
              COUNT(*) AS voteCount,
              COALESCE(SUM(vote_weight), 0) AS voteScore,
              COALESCE(SUM(is_priority), 0) AS priorityCount
       FROM feature_votes
       GROUP BY feature_id`,
    )
    .all();
  const segmentRows = database
    .prepare(
      `SELECT segment AS segment,
              COUNT(*) AS count
       FROM survey_submissions
       GROUP BY segment
       ORDER BY count DESC`,
    )
    .all();
  const blockerRows = database
    .prepare(
      `SELECT biggest_blocker AS blocker,
              COUNT(*) AS count
       FROM survey_submissions
       GROUP BY biggest_blocker
       ORDER BY count DESC`,
    )
    .all();
  const regionRows = database
    .prepare(
      `SELECT target_region AS region,
              COUNT(*) AS count
       FROM survey_submissions
       GROUP BY target_region
       ORDER BY count DESC`,
    )
    .all();
  const followupRows = database
    .prepare(
      `SELECT followup_preference AS preference,
              COUNT(*) AS count
       FROM survey_submissions
       GROUP BY followup_preference
       ORDER BY count DESC`,
    )
    .all();
  const recentRows = database
    .prepare(
      `SELECT segment AS segment,
              target_region AS targetRegion,
              biggest_blocker AS biggestBlocker,
              followup_preference AS followupPreference,
              created_at AS createdAt
       FROM survey_submissions
       ORDER BY created_at DESC
       LIMIT 5`,
    )
    .all();

  const votesByFeature = voteRows.reduce<Record<string, VoteAggregate>>((aggregates, row) => {
    const featureId = stringFromRow(row, "featureId");
    aggregates[featureId] = {
      voteCount: numberFromRow(row, "voteCount"),
      voteScore: numberFromRow(row, "voteScore"),
      priorityCount: numberFromRow(row, "priorityCount"),
    };
    return aggregates;
  }, {});
  const topKnownFeature = MARKET_FEATURES
    .map((feature) => ({ feature, aggregate: votesByFeature[feature.id] }))
    .filter((item): item is { feature: MarketFeature; aggregate: VoteAggregate } => Boolean(item.aggregate))
    .sort((left, right) => {
      const scoreDelta = right.aggregate.voteScore - left.aggregate.voteScore;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return right.aggregate.voteCount - left.aggregate.voteCount;
    })[0];
  const segmentsByAudience = aggregateCount(segmentRows, "segment");
  const blockersByIssue = aggregateCount(blockerRows, "blocker");
  const regionsByInterest = aggregateCount(regionRows, "region");
  const followupsByPreference = aggregateCount(followupRows, "preference");

  return {
    totalSubmissions: numberFromRow(submissionRow, "count"),
    contactableSubmissions: numberFromRow(contactableRow, "count"),
    topFeatureId: topKnownFeature?.feature.id ?? null,
    primarySegment: topKey(segmentsByAudience),
    topBlocker: topKey(blockersByIssue),
    votesByFeature,
    segmentsByAudience,
    blockersByIssue,
    regionsByInterest,
    followupsByPreference,
    recentSignals: recentRows.map((row) => ({
      segment: stringFromRow(row, "segment"),
      targetRegion: stringFromRow(row, "targetRegion"),
      biggestBlocker: stringFromRow(row, "biggestBlocker"),
      followupPreference: stringFromRow(row, "followupPreference"),
      createdAt: stringFromRow(row, "createdAt"),
    })),
  };
}

export function getMarketSnapshot(): MarketSnapshot {
  return {
    features: MARKET_FEATURES,
    stats: getMarketStats(),
  };
}

export function createMarketSubmission(input: MarketSubmissionInput): SubmitResult {
  const selectedFeatureIds = uniqueSelectedFeatures(input.selectedFeatureIds);
  const priorityFeatureId = trimText(input.priorityFeatureId, 120);
  const normalizedPriorityFeatureId = selectedFeatureIds.includes(priorityFeatureId) ? priorityFeatureId : "";
  const profile = input.profile ?? {};
  const contact = input.contact ?? {};
  const database = getDatabase();
  const submissionId = createId("sub");

  try {
    database.exec("BEGIN IMMEDIATE");
    database
      .prepare(
        `INSERT INTO survey_submissions (
          id,
          segment,
          city,
          work_mode,
          decision_timeline,
          budget_level,
          target_region,
          biggest_blocker,
          followup_preference,
          followup_note,
          contact_name,
          contact_method,
          contact_value,
          consent_to_contact
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        submissionId,
        optionOrFallback(SEGMENT_OPTIONS, profile.segment, "early_explorer"),
        trimText(profile.city, 80),
        optionOrFallback(WORK_MODE_OPTIONS, profile.workMode, "not_remote_yet"),
        optionOrFallback(TIMELINE_OPTIONS, profile.decisionTimeline, "researching"),
        optionOrFallback(BUDGET_OPTIONS, profile.budgetLevel, "free_research"),
        optionOrFallback(REGION_OPTIONS, profile.targetRegion, "undecided"),
        optionOrFallback(BLOCKER_OPTIONS, profile.biggestBlocker, "not_sure"),
        optionOrFallback(FOLLOWUP_OPTIONS, profile.followupPreference, "no_followup"),
        trimText(contact.note, 600),
        trimText(contact.name, 80),
        optionOrFallback(CONTACT_METHOD_OPTIONS, contact.method, "none"),
        trimText(contact.value, 160),
        contact.consentToContact === true ? 1 : 0,
      );

    const insertVote = database.prepare(
      `INSERT INTO feature_votes (
        id,
        submission_id,
        feature_id,
        feature_status,
        feature_title,
        vote_weight,
        is_priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const featureId of selectedFeatureIds) {
      const feature = getFeatureById(featureId);
      if (!feature) {
        throw new MarketInputError(`Unknown feature id: ${featureId}`);
      }

      const isPriority = feature.id === normalizedPriorityFeatureId;
      insertVote.run(
        createId("vote"),
        submissionId,
        feature.id,
        feature.status,
        feature.title,
        isPriority ? 3 : 1,
        isPriority ? 1 : 0,
      );
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  return {
    submissionId,
    recordedVotes: selectedFeatureIds.length,
    stats: getMarketStats(),
  };
}
