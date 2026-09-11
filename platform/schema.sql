-- CB-CAP D1 schema v1
-- Missing stays missing. Accepted records are not updated in place.

CREATE TABLE IF NOT EXISTS counties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fips TEXT NOT NULL,
  honesty TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('synthetic','public-demo','licensed')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lenses (
  id TEXT PRIMARY KEY,
  county_id TEXT NOT NULL,
  zcta TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  FOREIGN KEY (county_id) REFERENCES counties(id)
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  lens_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('evidenced','suspected','planned','missing')),
  mark TEXT NOT NULL,
  object_json TEXT NOT NULL,
  as_of TEXT NOT NULL,
  FOREIGN KEY (lens_id) REFERENCES lenses(id)
);

CREATE TABLE IF NOT EXISTS packs (
  id TEXT PRIMARY KEY,
  county_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  pack_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (county_id) REFERENCES counties(id)
);

CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  county_id TEXT NOT NULL,
  lens_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','awaiting_human','accepted','rejected')),
  owner TEXT,
  review_date TEXT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  decided_at TEXT,
  FOREIGN KEY (county_id) REFERENCES counties(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_lens ON evidence(lens_id, dimension);
CREATE INDEX IF NOT EXISTS idx_records_county ON records(county_id, status);
