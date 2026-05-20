import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

type DatabaseValue = string | number | bigint | null | Uint8Array;

type StatementResult = {
  changes: number;
  lastInsertRowid: number | bigint;
};

type StatementSync = {
  all: (...parameters: DatabaseValue[]) => Record<string, DatabaseValue>[];
  get: (...parameters: DatabaseValue[]) => Record<string, DatabaseValue> | undefined;
  run: (...parameters: DatabaseValue[]) => StatementResult;
};

type DatabaseSync = {
  exec: (sql: string) => void;
  prepare: (sql: string) => StatementSync;
};

type DatabaseSyncConstructor = new (location: string) => DatabaseSync;

const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire("node:sqlite") as {
  DatabaseSync: DatabaseSyncConstructor;
};

let database: DatabaseSync | null = null;

function resolveDatabasePath() {
  return process.env.GO_NOMAD_ADV_DB_PATH ?? path.join(process.cwd(), ".data", "go-nomad-adv.sqlite");
}

function initializeSchema(activeDatabase: DatabaseSync) {
  activeDatabase.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS survey_submissions (
      id TEXT PRIMARY KEY,
      interest_decision TEXT NOT NULL DEFAULT 'interested',
      segment TEXT NOT NULL,
      city TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      decision_timeline TEXT NOT NULL,
      budget_level TEXT NOT NULL,
      target_region TEXT NOT NULL DEFAULT 'undecided',
      biggest_blocker TEXT NOT NULL DEFAULT 'not_sure',
      followup_preference TEXT NOT NULL DEFAULT 'no_followup',
      followup_note TEXT NOT NULL DEFAULT '',
      contact_name TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      contact_value TEXT NOT NULL,
      consent_to_contact INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feature_votes (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL REFERENCES survey_submissions(id) ON DELETE CASCADE,
      feature_id TEXT NOT NULL,
      feature_status TEXT NOT NULL,
      feature_title TEXT NOT NULL,
      vote_weight INTEGER NOT NULL DEFAULT 1,
      is_priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS access_logs (
      id TEXT PRIMARY KEY,
      request_path TEXT NOT NULL,
      request_method TEXT NOT NULL,
      ip_address TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      referer TEXT NOT NULL DEFAULT '',
      accept_language TEXT NOT NULL DEFAULT '',
      forwarded_for TEXT NOT NULL DEFAULT '',
      header_snapshot TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_feature_votes_feature ON feature_votes(feature_id);
    CREATE INDEX IF NOT EXISTS idx_feature_votes_submission ON feature_votes(submission_id);
    CREATE INDEX IF NOT EXISTS idx_survey_submissions_segment ON survey_submissions(segment);
    CREATE INDEX IF NOT EXISTS idx_survey_submissions_created_at ON survey_submissions(created_at);
    CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_access_logs_request_path ON access_logs(request_path);
  `);

  ensureColumn(activeDatabase, "survey_submissions", "target_region", "TEXT NOT NULL DEFAULT 'undecided'");
  ensureColumn(activeDatabase, "survey_submissions", "biggest_blocker", "TEXT NOT NULL DEFAULT 'not_sure'");
  ensureColumn(activeDatabase, "survey_submissions", "followup_preference", "TEXT NOT NULL DEFAULT 'no_followup'");
  ensureColumn(activeDatabase, "survey_submissions", "followup_note", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(activeDatabase, "survey_submissions", "interest_decision", "TEXT NOT NULL DEFAULT 'interested'");
  ensureColumn(activeDatabase, "access_logs", "ip_address", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(activeDatabase, "access_logs", "user_agent", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(activeDatabase, "access_logs", "referer", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(activeDatabase, "access_logs", "accept_language", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(activeDatabase, "access_logs", "forwarded_for", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(activeDatabase, "access_logs", "header_snapshot", "TEXT NOT NULL DEFAULT '{}'"
  );

  activeDatabase.exec(
    `CREATE INDEX IF NOT EXISTS idx_survey_submissions_blocker ON survey_submissions(biggest_blocker);
     CREATE INDEX IF NOT EXISTS idx_survey_submissions_target_region ON survey_submissions(target_region);
     CREATE INDEX IF NOT EXISTS idx_survey_submissions_interest_decision ON survey_submissions(interest_decision);
     CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);`,
  );
}

function ensureColumn(activeDatabase: DatabaseSync, tableName: string, columnName: string, definition: string) {
  const columns = activeDatabase.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    activeDatabase.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function getDatabase() {
  if (database) {
    return database;
  }

  const databasePath = resolveDatabasePath();
  mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  initializeSchema(database);
  return database;
}
