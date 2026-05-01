-- Add salted password credentials for local product accounts.
-- Existing local users are backfilled with the documented local bootstrap password: "password".
ALTER TABLE "users" ADD COLUMN "passwordHash" VARCHAR(128);
ALTER TABLE "users" ADD COLUMN "passwordSalt" VARCHAR(128);

UPDATE "users"
SET
  "passwordSalt" = 'local-review-password-salt',
  "passwordHash" = '3bbff257761674495c3ad315d62259d7d7f1b13901c9c63eac6cb9bf189cc2f49d5254e6f2858b69cf2ac9cae04982f423a3253b239d3c450cb8c72785057e81'
WHERE "passwordHash" IS NULL OR "passwordSalt" IS NULL;

ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "passwordSalt" SET NOT NULL;
