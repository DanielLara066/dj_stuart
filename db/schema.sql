CREATE TABLE IF NOT EXISTS stuart_reviews (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 5 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stuart_reviews_recent ON stuart_reviews (created_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS stuart_review_limits (
  key text PRIMARY KEY,
  next_allowed_at timestamptz NOT NULL
);
